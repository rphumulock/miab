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

var webpack = require('webpack');

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


/**
 * The HtmlWebpackPlugin simplifies creation of HTML files to serve 
 * your webpack bundles. This is especially useful for webpack bundles
 *  that include a hash in the filename which changes every compilation.
 *  You can either let the plugin generate an HTML file for you, supply
 *  your own template using lodash templates, or use your own loader.
 * 
 * https://webpack.js.org/plugins/html-webpack-plugin/#components/sidebar/sidebar.jsx
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Clean directories before building...
 * https://github.com/johnagan/clean-webpack-plugin
 */
const CleanWebpackPlugin = require('clean-webpack-plugin')

/**
 * This is a webpack plugin that copies individual files or 
 * entire directories to the build directory.
 * https://github.com/kevlened/copy-webpack-plugin
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('../helpers');

const path = require('path');

/**
 * Used with the DefinePlugin plugin. Sets a global constant
 * that can be used to check whether we are in production. 
 * 
 * This information is gathered form process.env.NODE_ENV;
 * https://webpack.js.org/plugins/define-plugin/
 */
const ENV = process.env.NODE_ENV;

function genPlugins() {

  console.log('webpack plugins env value: ' + ENV);

  var pluginsArray = [
    /**
     * See documentaiton of const ENV above...
     */
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV)
      }
    }),
    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      helpers.root('src'), // location of your src
      {}
    ),
    /** Part of enabling vscode debugging... add WriteFilePlugin
     * so the webpack-devServer writes files to disk
     * https://github.com/AngularClass/angular2-webpack-starter/issues/144
     */
    new WriteFilePlugin(),
    /**
     * Automatically loads modules. Whenever the identifier is encountered as free 
     * variable in a module, the module is loaded automatically and the identifier 
     * is filled with the exports of the loaded module.
     * https://webpack.js.org/plugins/provide-plugin/
     */
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      Tether: 'tether'
    }),
    /**
     * Assign the module and chunk ids by occurrence count. 
     * Ids that are used often get lower (shorter) ids. 
     * This make ids predictable, reduces total file size and is recommended.
     * 
     * preferEntry (boolean) give entry chunks higher priority. 
     * This make entry chunks smaller but increases the overall size. (recommended)
     */
    //new webpack.optimize.OccurrenceOrderPlugin(true),

    // See documentation on ExtractTextPlugin above...
    new ExtractTextPlugin('[name]-[chunkhash].css'),
    /**
     * The CommonsChunkPlugin is an opt-in feature that creates a separate file 
     * (known as a chunk), consisting of common modules shared between multiple 
     * entry points. By separating common modules from bundles, the resulting chunked
     *  file can be loaded once initially, and stored in cache for later use. 
     * This results in pagespeed optimizations as the browser can quickly serve the 
     * shared code from cache, rather than being forced to load a larger bundle 
     * whenever a new page is visited.
     * 
     * https://webpack.js.org/plugins/commons-chunk-plugin/#options
     * https://webpack.js.org/concepts/entry-points/
     */
    new webpack.optimize.CommonsChunkPlugin({
      names: ['main', 'vendor', 'polyfills']
    }),
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: (module) => module.context && /node_modules/.test(module.context)
    }),*/
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: 'main',
      children: true,
      async: true,
      minChunks: ({ resource }) => (
        resource !== undefined &&
        resource.indexOf('node_modules') !== -1
      ),
    }),*/
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),*/
    // See documentation on HtmlWebpackPlugin above...
    new HtmlWebpackPlugin({
      template: helpers.root('src/index.html')
    }),
    /**
     * Fix for uglifyjsplugin in webpack for Angular 2
     * template loader
     * 
     * http://stackoverflow.com/questions/38983225/uglifyjsplugin-breaking-angular-2-templates
     * https://angular.io/docs/ts/latest/guide/webpack.html#!#production-configuration
     * https://angular.io/docs/ts/latest/guide/webpack.html#!#entries-outputs
     * 
     */
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: false
    })
  ];

  console.log('plugins array length before adds: ' + pluginsArray.length);

  if (ENV === 'production') {

    console.log('building w/ production plugins');

    // the path(s) that should be cleaned
    let pathsToClean = [
      'dist/*.js',
      'dist/*.html',
      'dist/*.map',
      'wwwroot/main*.js',
      'wwwroot/polyfills*.js',
      'wwwroot/vendor*.js',
      'wwwroot/chunk*js',
      'wwwroot/index.html'
    ]


    // the clean options to use
    let cleanOptions = {
      root: helpers.root(),
      //exclude:  [''],
      verbose: true,
      dry: false
    }


    pluginsArray = pluginsArray.concat([
      /**
       * A webpack plugin to remove/clean your build folder(s) before building
       * https://github.com/johnagan/clean-webpack-plugin
       */
      new CleanWebpackPlugin(pathsToClean, cleanOptions),

      /**
       * Minified Angular Projects can create errors
       * Resolves: // https://github.com/angular/angular/issues/10618
       */
      new webpack.optimize.UglifyJsPlugin({}),/*
        beautify: false,
        mangle: false,
        compress: {
          screw_ie8: true
        },
        comments: false
      }),
      /**
       * Prevents wepack from emitting new compiled files when an error is 
       * caught during compilation.
       *
       */
      new webpack.NoEmitOnErrorsPlugin(),
      
    ]);


  } else {

    console.log('building w/ development plugins');

    // the path(s) that should be cleaned
    let pathsToClean = [
      'webdev/*.js',
      'webdev/*.html',
      'webdev/*.map',
      'webdev/**/*.js'
    ]

    // the clean options to use
    let cleanOptions = {
      root: helpers.root(),
      //exclude:  [''],
      verbose: true,
      dry: false
    }

    let filesToCopy = [
      // Copy glob results, relative to context
      {
        context: helpers.root('wwwroot'),
        from: 'css/',
        to: helpers.root('webdev/css/')
      },
      {
        context: helpers.root('wwwroot'),
        from: 'img/',
        to: helpers.root('webdev/img/')
      },
      {
        context: helpers.root('wwwroot'),
        from: 'js/',
        to: helpers.root('webdev/js/')
      },
      {
        context: helpers.root('wwwroot'),
        from: 'sounds/',
        to: helpers.root('webdev/sounds/')
      },
      {
        context: helpers.root('wwwroot'),
        from: 'typicons/',
        to: helpers.root('webdev/typicons/')
      },
      {
        context: helpers.root('wwwroot'),
        from: 'font/',
        to: helpers.root('webdev/font/')
      }
    ]


    let copyOptions = {
      copyUnmodified: false,
      debug: 'warning'
    }

    pluginsArray = pluginsArray.concat([
      /**
       * A webpack plugin to remove/clean your build folder(s) before building
       * https://github.com/johnagan/clean-webpack-plugin
       */
      new CleanWebpackPlugin(pathsToClean, cleanOptions),

      /**
       * This is a webpack plugin that copies individual files or 
       * entire directories to the build directory.
       * https://github.com/kevlened/copy-webpack-plugin
       */
      new CopyWebpackPlugin(filesToCopy, copyOptions)
    ]);


  }
  console.log('plugins array length after adds: ' + pluginsArray.length);

  return pluginsArray;
}

module.exports = genPlugins();
