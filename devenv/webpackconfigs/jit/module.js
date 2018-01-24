/**
 * The goal is to have all of the assets in your project to be webpack's concern 
 * and not the browser's. (This doesn't mean that they all have to be bundled together). 
 * webpack treats every file (.css, .html, .scss, .jpg, etc.) as a module. 
 * However, webpack only understands JavaScript.
 * 
 * 
 * Loaders in webpack transform these files into modules as they are added to your dependency graph.
 * At a high level, they have two purposes in your webpack config.
 * 
 * 1. Identify what files should be transformed by a certain loader. (test property)
 * 2. Transform that file so that it can be added to your dependency graph (and eventually your bundle). (use property)
 */
'use strict';

var commonRules = require('../module.common');

module.exports = {
  // .ts files for TypeScript
  rules: [{
    test: /\.ts$/,
    use: [
      'awesome-typescript-loader',
      'angular-router-loader',
      'angular2-template-loader',
      'source-map-loader'
    ]
  }].concat(commonRules)
};
