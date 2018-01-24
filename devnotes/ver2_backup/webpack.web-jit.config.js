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
outputConfig.path = helpers.root('jit');


var webpackConfig = {
  /**
   * Because JavaScript can be written for both server and browser, 
   * webpack offers multiple deployment targets that you can set in your webpack configuration
   * https://webpack.js.org/concepts/targets/
   */
  target: 'web',
  
  entry: require('./webpackconfigs/jit/entry.js'),
  
  output: outputConfig,

  //node: require('./webpackconfigs/node_env.js');

  module: require('./webpackconfigs/jit/module.js'),

  resolve: require('./webpackconfigs/resolve.js'),

  //externals: require('./webpackconfigs/externals.js'),

  plugins: require('./webpackconfigs/jit/plugins.js'),

  //noParse: require('./webpackconfigs/noparse.js'),

  devServer: require('./webpackconfigs/devserver.js')

}


module.exports = webpackConfig;