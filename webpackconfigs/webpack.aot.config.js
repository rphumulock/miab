/**
 * webpack is a module bundler for modern JavaScript applications. 
 * It is incredibly configurable, but to get started you only need to 
 * understand Four Core Concepts: entry, output, loaders, and plugins.
 * This document is intended to give a high-level overview of these concepts, 
 * while providing links to detailed concept specific use-cases.
 * 
 * https://webpack.js.org/concepts/
 * https://webpack.github.io/
 * https://github.com/webpack/webpack/tree/master/examples
 * 
 */

// Helper functions that increase ease of use 
var helpers = require('../helpers');

// Grab output configuration parameters
let outputConfig = require('./output.js');

// Now specify where the output will actually happen.
outputConfig.path = helpers.root('dist');

// Webpack Base Config 
var webpackConfig = {
  /**
   * Because JavaScript can be written for both server and browser, 
   * webpack offers multiple deployment targets that you can set in your webpack configuration
   * https://webpack.js.org/concepts/targets/
   */
  target: 'web',

  entry: require('./aot/entry.js'),

  // https://github.com/blacksonic/angular2-aot-cli-webpack-plugin/blob/master/webpack.aot.config.js
  //context: helpers.root('src'),
  
  output: outputConfig,

  //node: require('./node_env.js');

  module: require('./aot/module.js'),

  resolve: require('./resolve.js'),

  //externals: require('./externals.js'),

  plugins: require('./plugins.js'),
  
  //noParse: require('./noparse.js'),

  devServer: require('./devServer.js')

}

module.exports = webpackConfig;
