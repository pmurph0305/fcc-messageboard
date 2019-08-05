/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(function (req, res) {
      if (req.db) {
        console.log(req.db);
      }
    })
    
  app.route('/api/replies/:board');

};
