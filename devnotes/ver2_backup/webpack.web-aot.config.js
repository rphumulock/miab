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

var helpers = require('./js/node.helpers');
let outputConfig = require('./webpackconfigs/output.js');
outputConfig.path = helpers.root('aot');

// Webpack Base Config 
var webpackConfig = {
  /**
   * This option controls if and how Source Maps are generated.
   * https://webpack.js.org/configuration/devtool/
   */
  devtool: 'source-map',

  /**
   * Because JavaScript can be written for both server and browser, 
   * webpack offers multiple deployment targets that you can set in your webpack configuration
   * https://webpack.js.org/concepts/targets/
   */
  target: 'web',

  entry: require('./webpackconfigs/aot/entry.js'),

  // https://github.com/blacksonic/angular2-aot-cli-webpack-plugin/blob/master/webpack.aot.config.js
  //context: helpers.root('src'),
  
  output: outputConfig,

  //node: require('./webpackconfigs/node_env.js');

  module: require('./webpackconfigs/aot/module.js'),

  resolve: require('./webpackconfigs/resolve.js'),

  //externals: require('./webpackconfigs/externals.js'),

  plugins: require('./webpackconfigs/aot/plugins.js'),
  
  //noParse: require('./webpackconfigs/noparse.js'),

  devServer: require('./webpackconfigs/devServer.js')

}

module.exports = webpackConfig;
