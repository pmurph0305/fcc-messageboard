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
chai.use(chaiHttp);

suite('Functional Tests', function() {

  let test_thread_id = '';
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('post a thread to /api/threads/:board', function(done) {
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
        })
      })
    });
    
    suite('GET', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
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
        })
      })
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
