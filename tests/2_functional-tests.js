/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var expect = chai.expect;
var ObjectID = require('mongodb').ObjectID;
chai.use(chaiHttp);

// US 12: Complete functional tests that wholely test routes and pass.
suite('Functional Tests', function() {

  let test_thread_id = '';
  suite('API ROUTING FOR /api/threads/:board', function() {
    // US 4: I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.
    // (Recomend res.redirect to board page /b/{board})
    //  Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
    suite('POST', function() {
      test('POST a thread to /api/threads/:board', function(done) {
        chai.request(server)
        .post('/api/threads/tests')
        .send({
          text: 'test text',
          delete_password: 'delete test'
        })
        .end(function (err, res) {
          //console.log(res);
          assert.equal(res.status, 200);
          expect(res).to.redirect;
          expect(res).to.redirectTo(/\/b\/tests/)
          // save the resulting thread_id for future tests.
          let id = res.redirects[0].match(/\w+$/);
          test_thread_id = id[0];
          done();
        });
      });
    });
    
    // US 6: I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. 
    // The reported and delete_passwords fields will not be sent.
    suite('GET', function() {
      test('GET threads from /api/threads/:board', function(done) {
        chai.request(server)
        .get('/api/threads/tests')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          // max 10 threads
          assert.isBelow(res.body.length, 11);
          for (let i=0; i< res.body.length; i++) {
            // max 4 replies
            assert.isBelow(res.body[i].replies.length, 4);
            // make sure we have the correct keys for each thread
            assert.doesNotHaveAnyKeys(res.body[i], ["delete_password", "reported"]);
            assert.hasAllKeys(res.body[i], ["text", "created_on", "bumped_on", "replies", "_id"]);
            for(let j=0; j<res.body[i].replies.length; j++) {
              // and make sure each reply has the correct keys as well.
              assert.hasAllKeys(res.body[i].replies[j], ["text", "created_on", "_id"]);
              assert.doesNotHaveAnyKeys(res.body[i].replies[j], ["delete_password", "reported"]);
            }
          }
          done();
        });
      });
    });
    
    // US 8: I can delete a thread completely if I send a DELETE request to /api/threads/{board}
    // and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
    suite('DELETE', function() {
      test('DELETE a thread with invalid and then valid password', function(done) {
        // create a new thread for the test.
        chai.request(server)
        .post('/api/threads/tests')
        .send({
          text: 'test',
          delete_password: 'delete test'
        })
        .end(function (err, res) {
          let id = res.redirects[0].match(/\w+$/);
          let thread_id = id[0];
          assert.equal(res.status, 200);
          chai.request(server)
          .delete('/api/threads/tests')
          .send({
            thread_id: thread_id,
            delete_password: 'incorrect',
          })
          .end(function(err2, res2) {
            assert.equal(res2.status, 200);
            assert.equal(res2.body.message, "incorrect password");
            chai.request(server)
            .delete('/api/threads/tests')
            .send({
              thread_id: thread_id,
              delete_password: 'delete test'
            })
            .end(function(err3, res3) {
              assert.equal(res3.status, 200);
              assert.equal(res3.body.message, "success");
              done();
            });
          });
        });
      });
    });
    
    // US 10: I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board}
    // and pass along the thread_id. (Text response will be 'success')
    suite('PUT', function() {
      test('PUT /api/threads/{board} with valid & non-exisiting thread id', function(done) {
        chai.request(server)
        .put('/api/threads/tests')
        .send({thread_id: ObjectID()})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "fail", "may fail if objectid() generates an existing objectid");
          done();
        })
      });

      test('PUT /api/threads/{board} with valid & existing thread id', function(done) {
        chai.request(server)
        .put('/api/threads/tests')
        .send({thread_id: test_thread_id})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "success");
          done();
        })
      })

      test('put /api/threads/{board} with invalid thread id', function(done) {
        chai.request(server)
        .put('/api/threads/tests')
        .send({thread_id: ".invalidid:"})
        .end(function(err, res) {
          assert.equal(res.status, 400);
          done();
        })
      })
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    // US 5: I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} 
    // and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id})
    // In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
    suite('POST', function() {
      test('POST reply to /api/replies/{board}', function(done) {
        chai.request(server)
        .post('/api/replies/tests')
        .send({
          text: 'test reply',
          delete_password: 'test delete reply',
          thread_id: test_thread_id,
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          expect(res, 'should redirect').to.redirect;
          expect(res, 'should redirect to /b/tests/'+test_thread_id).to.redirectTo(new RegExp('\/b\/tests/'+test_thread_id+''));
          done();
        });
      });
    });
    
    // US 7: I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.
    // The reported and delete_passwords fields will not be sent.
    suite('GET', function() {
      test('GET /api/replies/{board}?thread_id={thread_id}', function(done) {
        chai.request(server)
        .get('/api/replies/tests?thread_id='+test_thread_id)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.hasAllKeys(res.body, ["_id", "text", "created_on", "bumped_on", "replies"]);
          assert.doesNotHaveAllKeys(res.body, ["delete_password", "reported"]);
          for (let i = 0; i < res.body.replies.length; i++) {
            assert.hasAllKeys(res.body.replies[i], ["text", "created_on", "_id"]);
            assert.doesNotHaveAllKeys(res.body.replies[i], ["delete_password", "reported"]);
          }
          done();
        });
      });
    });
    
    // US 11: I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board}
    //  and pass along the thread_id & reply_id. (Text response will be 'success')
    suite('PUT', function() {
      test("PUT /api/replies/tests with valid, existing ids", function(done) {
        chai.request(server)
        .get('/api/replies/tests?thread_id='+test_thread_id)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          assert.isAtLeast(res.body.replies.length, 1);
          let reply_id = res.body.replies[0]["_id"];
          chai.request(server)
          .put('/api/replies/tests')
          .send({
            thread_id: test_thread_id,
            reply_id: reply_id
          })
          .end(function(err2, res2) {
            assert.equal(res2.status, 200);
            assert.equal(res2.body.message, "success");
            done();
          });
        });
      });
      
      test("PUT /api/replies/tests with valid thread_id, and valid but not-in-db reply_id", function(done) {
        chai.request(server)
        .put('/api/replies/tests')
        .send({ 
          thread_id: test_thread_id,
          reply_id: ObjectID()
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.message, "fail");
          done();
        });
      });

      test("PUT /api/replies/tests with invalid thread/reply_id", function(done) {
        chai.request(server)
        .put('/api/replies/tests')
        .send({
          thread_id: ":invalid",
          reply_id: ":alsoinvalid."
        })
        .end(function(err, res) {
          assert.equal(res.status, 400);
          done();
        })
      });
    });
    
    // US 9: I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} 
    // and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')
    suite('DELETE', function() {     
      test("DELETE reply with incorrect then correct password", function(done) {
        chai.request(server)
        .get('/api/replies/tests?thread_id='+test_thread_id)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          assert.isAtLeast(res.body.replies.length, 1);
          let reply_id = res.body.replies[0]["_id"];
          chai.request(server)
          .delete('/api/replies/tests')
          .send({
            thread_id: test_thread_id,
            reply_id: reply_id,
            delete_password: 'incorrect'
          })
          .end(function(err1, res1) {
            assert.equal(res1.status, 200);
            assert.equal(res1.body.message, "incorrect password");
            chai.request(server)
            .delete('/api/replies/tests')
            .send({
              thread_id: test_thread_id,
              reply_id: reply_id,
              delete_password: 'test delete reply'
            })
            .end(function(err2, res2) {
              assert.equal(res2.status, 200);
              assert.equal(res2.body.message, "success");
              done();
            });
          });
        });
      });
    });
  });
});
