/**
 * Once you've bundled all of your assets together, 
 * you still need to tell webpack where to bundle your application. 
 * The webpack output property tells webpack how to treat bundled code.
 * https://webpack.js.org/configuration/output/
 * 
 * -->> Important <-----
 * To use this file you must add a "path" property to the
 * exported object to specify the output directory
 * 
 * e.g:
 * var outputConfig = require(<path to this file>);
 * outputConfig.path = <the output path>
 */
'use strict';

const helpers = require('../helpers');

module.exports = {
  publicPath: '',
  filename: '[name].[chunkhash].bundle.js',
  // Part of enabling vscode debugging... comment-out:
  // sourceMapFilename
  // https://github.com/AngularClass/angular2-webpack-starter/issues/144
  //sourceMapFilename: '[name].bundle.map', 
  chunkFilename: '[id].chunk.js',
  // Normalize webpack file paths for vscode
  // https://github.com/AngularClass/angular2-webpack-starter/issues/144
  //
  // another untested alternative is:
  // devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  // from: http://stackoverflow.com/questions/36470946/debug-webpack-bundled-node-ts-with-visual-studio-code
  devtoolModuleFilenameTemplate: function (info) {
    var resourcePath = info.absoluteResourcePath;
    if (resourcePath.indexOf(__dirname) !== 0) {
      // Normalize resouce path if it is not an absolute path
      // (e.g. 'node_modules/rxjs/Observable.js')
      resourcePath = helpers.root(resourcePath);
    }
    if (resourcePath.charAt(0) === '/') {
      // Mac OS X absolute path has a leading slash already
      // https://github.com/Microsoft/vscode-chrome-debug/issues/63#issuecomment-163524778
      return 'file://' + resourcePath;
    } else {
      return 'file:///' + resourcePath;
    }
  },
  // Normalize webpack file paths for vscode
  // https://github.com/AngularClass/angular2-webpack-starter/issues/144
  //
  // another untested alternative is:
  // devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  // from: http://stackoverflow.com/questions/36470946/debug-webpack-bundled-node-ts-with-visual-studio-code
  devtoolFallbackModuleFilenameTemplate: function (info) {
    var resourcePath = info.absoluteResourcePath;
    if (resourcePath.indexOf(__dirname) !== 0) {
      // Normalize resouce path if it is not an absolute path
      // (e.g. 'node_modules/rxjs/Observable.js')
      resourcePath = helpers.root(resourcePath);
    }
    if (resourcePath.charAt(0) === '/') {
      // Mac OS X absolute path has a leading slash already
      // https://github.com/Microsoft/vscode-chrome-debug/issues/63#issuecomment-163524778
      return 'file://' + resourcePath;
    } else {
      return 'file:///' + resourcePath;
    }
  }
};
