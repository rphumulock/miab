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
 * https://gist.github.com/madx/53853c3d7b527744917f
 * 
 * 
 * 
 */

/**
 * Requires for weback itself...
 */
var helpers = require('../js/node.helpers');
let outputConfig = require('./webpackconfigs/output.js');
outputConfig.path = helpers.root('node');

var webpackConfig = {

  /**
   * Because JavaScript can be written for both server and browser, 
   * webpack offers multiple deployment targets that you can set in your webpack configuration
   * https://webpack.js.org/concepts/targets/
   */
  target: 'node',

  /**
   * webpack creates a graph of all of your application's dependencies.
   * The starting point of this graph is known as an entry point.
   * The entry point tells webpack where to start and follows the graph of dependencies to know what to bundle. 
   * You can think of your application's entry point as the contextual root or the first file to kick off your app.
   * https://webpack.js.org/concepts/entry-points/
   */
  entry: {
    'main': './src/<entry file>.ts', // edit this where needed - EG
  },

  externals: require('./webpackconfigs/node/externals'),

  output: outputConfig,

  /**
   * These options change how modules are resolved. webpack provides reasonable defaults,
   * but it is possible to change the resolving in detail. 
   * Have a look at Module Resolution for more explanation of how the resolver works.
   * 
   * https://webpack.js.org/configuration/resolve/#components/sidebar/sidebar.jsx
   * https://webpack.js.org/concepts/module-resolution/
   * 
   */
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [ helpers.root('node_modules') ]
  },

  plugins: require('./webpackconfigs/node/plugins.js'),

  modules: require('./webpackconfigs/node/module.js'),

  //node: require('./webpackconfigs/node_env.js'),

  //noParse: require('./webpackconfigs/noparse.js')

}


module.exports = webpackConfig;
