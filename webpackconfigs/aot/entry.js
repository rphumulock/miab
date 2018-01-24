/**
 * webpack creates a graph of all of your application's dependencies.
 * The starting point of this graph is known as an entry point.
 * The entry point tells webpack where to start and follows the graph of dependencies to know what to bundle. 
 * You can think of your application's entry point as the contextual root or the first file to kick off your app.
 * https://webpack.js.org/concepts/entry-points/
 */
'use strict'

const helpers = require('../../helpers');

module.exports = {
  'main': helpers.root('src/main.browser.aot.ts'),
  'polyfills': helpers.root('src/polyfills.browser.ts'),
  'vendor': helpers.root('src/vendor.ts')
};
