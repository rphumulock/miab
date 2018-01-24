/**
 * Customize the NodeJS environment using polyfills or mocks...
 * 
 * Include polyfills or mocks for various node stuff:
 * 
 * console: true or false
 * global: true or false
 * process: true, "mock" or false
 * Buffer: true or false
 * __filename: true (real filename relative to the context option), "mock" ("/index.js") or false (normal node __dirname)
 * __dirname: true (real dirname relative to the context option), "mock" ("/") or false (normal node __dirname)
 * <node buildin>: true, "mock", "empty" or false
 * 
 * https://webpack.github.io/docs/configuration.html#node
 * 
 */
'use strict';

module.exports = {
  global: true,
  crypto: 'empty',
  __dirname: true,
  __filename: true,
  process: true,
  Buffer: false,
  clearImmediate: false,
  setImmediate: false
}
