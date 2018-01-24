/**
 * webpack-dev-server can be used to quickly develop an application.
 *  https://webpack.js.org/configuration/dev-server/
 */
'use strict'

const helpers = require('../helpers');

module.exports = {
  // Tell the server where to serve content from. This is only necessary if you want to serve static files. 
  contentBase: [helpers.root("webdev")],
  watchContentBase: true,
  // When using the HTML5 History API, the index.html page will likely have to be served in place of any 404 responses.
  historyApiFallback: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
  /*,
      headers: {
        "Access-Control-Allow-Origin": "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      }*/
};
