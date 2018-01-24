var webpack = require('webpack');
var path = require('path');
var helpers = require('./src/node.helpers');
var webpackMerge = require('webpack-merge');
const providePlugin = require('webpack/lib/ProvidePlugin');

// Part of enabling vscode debugging... add WriteFilePlugin
// so the webpack-devServer writes files to disk
// https://github.com/AngularClass/angular2-webpack-starter/issues/144
const WriteFilePlugin = require('write-file-webpack-plugin'); // needed for vscode debugging

// Webpack Config
// https://webpack.js.org/guides/shimming/
var webpackConfig = {
  entry: {
    'main': './src/main.browser.ts',
  },
  output: {
    publicPath: ' ',
    path: path.resolve(__dirname, './dist'),
  },
  // Need to look this up
 externals: {
    //WOW: 'WOW' ///wow\.(min\.)?js$/i
    //'window': 'window'
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
      path.resolve(__dirname, './src'),
      {
        // your Angular Async Route paths relative to this root directory
      }
    ),
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      //WOW: 'wow'
    }),
    // Part of enabling vscode debugging... add WriteFilePlugin
    // so the webpack-devServer writes files to disk
    // https://github.com/AngularClass/angular2-webpack-starter/issues/144
    new WriteFilePlugin()
  ],

  module: {
    loaders: [
      // .ts files for TypeScript
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader',
          'angular2-template-loader',
          'angular2-router-loader'
        ]
      },
      { test: /\.css$/, loaders: ['to-string-loader', 'style-loader', 'css-loader'] },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.jpe?g$|\.gif$|\.png$/i, loader: "file-loader" },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['raw-loader', 'sass-loader'] // sass-loader not scss-loader
      },
      {
        /**
         * https://webpack.js.org/guides/shimming/
         * 
         * imports-loader inserts necessary globals into the required legacy module. 
         * For example, Some legacy modules rely on this being the window object.
         *  This becomes a problem when the module is executed in a CommonJS context 
         * where this equals module.exports. 
         * In this case you can override this using the imports-loader.
         * 
         * Let's say a library creates a global variable that it expects its 
         * consumers to use; In this case, we can use exports-loader, to export 
         * that global variable in CommonJS format. For instance, in order to 
         * export file as file and helpers.parse as parse:
         * 
         * https://webpack.js.org/loaders/script-loader/ 
         * The script-loader evaluates code in the global context, just like you 
         * would add the code into a script tag. In this mode, every normal library 
         * should work. require, module, etc. are undefined.
         * The file is added as string to the bundle. It is not minimized by webpack, 
         * so use a minimized version. There is also no dev tool support for libraries 
         * added by this loader.
         * Assuming you have a legacy.js file containing …
         */
        test: /wow\.(min\.)?js$/, loaders: [ 'exports-loader?this.Window.WOW' ,'imports-loader?this=>window']
      }
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
  }
};


// Our Webpack Defaults
var defaultConfig = {
  devtool: 'source-map',

  output: {
    filename: '[name].bundle.js',
    //sourceMapFilename: '[name].map',
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
  },

  resolve: {
    extensions: ['.ts', '.js', '.scss'],
    modules: [path.resolve(__dirname, 'node_modules')]
  },

  devServer: {
    contentBase: [path.join(__dirname, "dist"), path.join(__dirname, "src")],
    watchContentBase: true,
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
    //contentBase: path.join(helpers.root("./src/app/assets"))
  },

  node: {
    fs: "empty",
    global: true,
    crypto: 'empty',
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false
  }
};


module.exports = webpackMerge(defaultConfig, webpackConfig);
