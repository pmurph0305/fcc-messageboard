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
          res.json({ message: "Database Error." })
        }
        else {
          //(Recomend res.redirect to board page /b/{board}), but /b/{board}/{thread_id} seems more useful.
          if (result.ops.length) {
            res.redirect('/b/'+board+'/'+result.ops[0]._id);
          } else {
            res.redirect('/b/'+board);
          }
        }
      })
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
        res.json({ message: "Invalid thread id." });
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
            res.json({ message: "Database Error." })
          }
          else {
            // (Recomend res.redirect to thread page /b/{board}/{thread_id}) 
            res.redirect('/b/' + board + '/' + thread_id);
          }
        });
      }
    })

};
