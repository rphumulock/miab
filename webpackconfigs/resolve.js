/**
 * These options change how modules are resolved. webpack 
 * provides reasonable defaults, but it is possible to 
 * change the resolving in detail. 
 * 
 * https://webpack.js.org/configuration/resolve/
 * https://webpack.js.org/concepts/module-resolution
 */
'use strict';
const helpers = require('../helpers');

module.exports = {
  extensions: ['.ts', '.js', 'scss', 'css'],
  modules: [helpers.root('node_modules'), helpers.root('src')]
}
