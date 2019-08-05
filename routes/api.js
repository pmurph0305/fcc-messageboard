/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

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
          //(Recomend res.redirect to board page /b/{board}) 
          res.redirect('/b/'+board);
        }
      })
    })
    
  app.route('/api/replies/:board');

};
