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

const helpers = require('../helpers');

/**
 * It moves all the require("style.css")s in entry chunks into a separate 
 * single CSS file. So your styles are no longer inlined into the JS bundle, 
 * but separate in a CSS bundle file (styles.css). If your total stylesheet 
 * volume is big, it will be faster because the CSS bundle is loaded in 
 * parallel to the JS bundle.
 * 
 * https://github.com/webpack-contrib/extract-text-webpack-plugin#extract
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  rules: [
    /*{
      test: /\.sass$/,
      include: helpers.root('src/app'),
      loaders: ['to-string-loader','css-loader','sass-loader'] 
    },
    {
      test: /\.scss$/,
      include: /node_modules/,
      loaders: [ 'raw-loader', 'sass-loader' ]
    },*/
    // CSS Loading...
    // Start here: https://angular.io/docs/ts/latest/guide/webpack.html#!#common-rules
    // Also checkout: https://github.com/webpack-contrib/style-loader/issues/123#issuecomment-227185413
    {
      test: /\.css$/,
      exclude: [helpers.root('webdev/css'), helpers.root('src/app')],
      // See documentation on ExtractTextPlugin above...
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        //use: [ 'to-string-loader','css-loader?sourceMap' ]
        use: ['css-loader?sourceMap']
      })
    },
    {
      test: /\.css$/,
      include: [helpers.root('src/app')],
      loaders: ['raw-loader']
    },
    {
      //http://stackoverflow.com/questions/38983225/uglifyjsplugin-breaking-angular-2-templates
      //https://angular.io/docs/ts/latest/guide/webpack.html#!#production-configuration
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: false
        }
      }]
    },
    /**
     * https://webpack.js.org/guides/shimming/
     * 
     * imports-loader inserts necessary globals into the required legacy module. 
     * For example, Some legacy modules rely on this being the window object.
     *  This becomes a problem when the module is executed in a CommonJS context 
     * where this equals module.exports. 
     * In this case you can override this using the imports-loader.
     */
    // { test: /wow\.(min\.)?js$/, loader: 'imports-loader?this=>window' },
    /** 
     * Let's say a library creates a global variable that it expects its 
     * consumers to use; In this case, we can use exports-loader, to export 
     * that global variable in CommonJS format. For instance, in order to 
     * export file as file and helpers.parse as parse.
     */
    // { test: /wow\.(min\.)?js$/, loaders: 'exports-loader?this.Window.WOW' },
    /**
     * https://webpack.js.org/loaders/script-loader/ 
     * The script-loader evaluates code in the global context, just like you 
     * would add the code into a script tag. In this mode, every normal library 
     * should work. require, module, etc. are undefined.
     * The file is added as string to the bundle. It is not minimized by webpack, 
     * so use a minimized version. There is also no dev tool support for libraries 
     * added by this loader.
     * Assuming you have a legacy.js file containing …
     */
    // { test: /wow\.(min\.)?js$/, loader: 'script-loader' }
  ]
};
