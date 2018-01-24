/**
 * Since Loaders only execute transforms on a per-file basis, plugins are most commonly used
 * (but not limited to) performing actions and custom functionality on "compilations" or 
 * "chunks" of your bundled modules (and so much more). 
 * The webpack Plugin system is extremely powerful and customizable.
 * 
 * In order to use a plugin, you just need to require() it and add it to the plugins array. 
 * Most plugins are customizable via options. 
 * Since you can use a plugin multiple times in a config for different purposes, 
 * you need to create an instance of it by calling it with new.
 */
'use strict';

/**
 * Automatically loads modules. Whenever the identifier is 
 * encountered as free variable in a module,
 * the module is loaded automatically and the identifier is 
 * filled with the exports of the loaded module.
 * 
 * https://webpack.js.org/plugins/provide-plugin/
 */
require('webpack/lib/ProvidePlugin');


/**
 * Part of enabling vscode debugging... add WriteFilePlugin
 * so the webpack-devServer writes files to disk
 * https://github.com/AngularClass/angular2-webpack-starter/issues/144
 */
const WriteFilePlugin = require('write-file-webpack-plugin'); // needed for vscode debugging



module.exports = [

  new webpack.IgnorePlugin(/\.(css|less)$/),
  /**
   * BannerPlugin adds a banner at the top of each generated chunck
   * 
   * https://www.npmjs.com/package/source-map-support
   * This module provides source map support for stack traces in 
   * node via the V8 stack trace API. It uses the source-map module
   * to replace the paths and line numbers of source-mapped files 
   * with their original paths and line numbers.
   */
  new webpack.BannerPlugin({
    banner: 'require("source-map-support").install();',
    raw: true,
    entryOnly: false
  }),

  /**
   * Automatically loads modules. Whenever the identifier is encountered as free 
   * variable in a module, the module is loaded automatically and the identifier 
   * is filled with the exports of the loaded module.
   * 
   * The ProvidePlugin makes a module available as a variable in every other 
   * module required by webpack. The module is required only if you use the variable. 
   * Most legacy modules rely on the presence of specific globals, 
   * like jQuery plugins do on $ or jQuery. In this scenario, you can configure 
   * webpack to prepend var $ = require(“jquery”) every time it encounters the 
   * global $ identifier.
   * https://webpack.js.org/plugins/provide-plugin/
   */
  new webpack.ProvidePlugin({
    jQuery: 'jquery',
    $: 'jquery',
    jquery: 'jquery'
  }),
  // Part of enabling vscode debugging... add WriteFilePlugin
  // so the webpack-devServer writes files to disk
  // https://github.com/AngularClass/angular2-webpack-starter/issues/144
  new WriteFilePlugin()
  
]
