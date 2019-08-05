/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
  
  app.route('/api/threads/:board')
    // US 4: I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.(Recomend res.redirect to board page /b/{board}) 
    // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
    .post(function(req, res) {
      // board is also submitted with the form (req.body.board), but US 4 only specifies form data of text, and delete password, so we're using the param board.
      let board = req.params.board;
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      // post to a board
      // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
      db.collection(board).insertOne({
        text: text,
        delete_password: delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      }, function(err, result) {
        if (err) {
          console.log("DB ERROR:" + err);
          // should normally be res.sendStatus(500) for internal server error for REST API.
          res.sendStatus(500);
        }
        else {
          //(Recomend res.redirect to board page /b/{board}), but /b/{board}/{thread_id} seems more useful.
          if (result.ops.length) {
            res.redirect('/b/'+board+'/'+result.ops[0]._id);
          } else {
            res.redirect('/b/'+board);
          }
        }
      });
    })

    // US 6: I can GET an array of the most recent 10 bumped threads on the board with 
    // only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
    .get(function(req, res) {
      let board = req.params.board;
      db.collection(board).find({}, {
        limit: 10,
        // sort by bumped_on
        sort: { bumped_on: -1 },
        projection: {
          // exclude fields
          delete_password: 0,
          reported: 0,
          "replies.delete_password": 0,
          "replies.reported": 0,
          // return 3 most recent replies.
          replies: { $slice: -3 }
        }
      }).toArray().then(result => {
        res.json(result);
      });
    })
    
  app.route('/api/replies/:board')
    // US 5: I can POST a reply to a thead on a specific board by passing
    // form data text, delete_password, & thread_id to /api/replies/{board} 
    // and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) 
    // In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
    .post(function(req, res) {
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      let thread_id = req.body.thread_id;
      let board = req.params.board;
      // make sure we have a valid thread_id.
      if (!ObjectID.isValid(thread_id)) {
        res.sendStatus(400);
      } else {
        db.collection(board).findOneAndUpdate({
          _id: ObjectID(thread_id)
        }, {
          $set: {
            bumped_on: new Date()
          },  
          $push: { 
            replies: {
              text: text,
              created_on: new Date,
              delete_password: delete_password,
              reported: false
            }
          }
        }, function(err, result) {
          if (err) {
            console.log("DB ERROR:" + err); 
            res.sendStatus(500);
          }
          else {
            // (Recomend res.redirect to thread page /b/{board}/{thread_id}) 
            res.redirect('/b/' + board + '/' + thread_id);
          }
        });
      }
    })

    // US 7: I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields.
    // The reported and delete_passwords fields will not be sent.
    .get(function(req, res) {
      let board = req.params.board;
      let thread_id = req.query.thread_id;
      if (!ObjectID.isValid(thread_id)) {
        res.sendStatus(400);
      } else {
        db.collection(board).find({
          _id: ObjectID(thread_id)
        },{
          projection: {
             // exclude fields
            delete_password: 0,
            reported: 0,
            "replies.delete_password": 0,
            "replies.reported": 0,
          }
        }).toArray().then(result => {
          if (result.length) {
            res.json(result[0]);
          } else {
            res.sendStatus(500);
          }
        });
      }
    })

};
