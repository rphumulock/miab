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
const environment = process.env.NODE_ENV;

console.log('env == ' + environment);
module.exports = require('./webpackconfigs/webpack.jit.config.js');
