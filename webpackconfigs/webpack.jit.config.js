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

// Configure production vs development settings
if (process.env.NODE_ENV === 'production') {
  outputConfig.path = helpers.root('dist');
  devToolConfig = '';
} else {
  outputConfig.path = helpers.root('webdev');
  devToolConfig = 'source-map'
}



var webpackConfig = {
  /**
   * This option controls if and how Source Maps are generated.
   * https://webpack.js.org/configuration/devtool/
   */
  devtool: devToolConfig,

  /**
   * Configure how performance hints are shown. 
   * For example if you have an asset that is over 250kb, 
   * webpack will emit a warning notifiying you of this.
   * https://webpack.js.org/configuration/performance/#performance
   */
  performance: {
        hints: 'warning'
    },

  /**
   * Because JavaScript can be written for both server and browser, 
   * webpack offers multiple deployment targets that you can set in your webpack configuration
   * https://webpack.js.org/concepts/targets/
   */
  target: 'web',

  stats: true,

  entry: require('./jit/entry.js'),

  output: outputConfig,

  //node: require('./node_env.js');

  module: require('./jit/module.js'),

  resolve: require('./resolve.js'),

  //externals: require('./externals.js'),

  plugins: require('./plugins.js'),

  //noParse: require('./noparse.js'),

  devServer: require('./devserver.js')

}


module.exports = webpackConfig;
