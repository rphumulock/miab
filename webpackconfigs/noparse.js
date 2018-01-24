/**
   * Prevent webpack from parsing any files matching the given regular expression(s).
   * Ignored files should not have calls to import, require, define or any other importing mechanism.
   * 
   * These files can only have require calls to dependencies marked as external or any 
   * dependency that isn’t in any webpack chunk. Because that dependency will be “encapsulated”
   *  by webpack inside the bundle and won’t be accesible through regular require calls.
   * 
   * https://webpack.js.org/configuration/module/#module-noparse
   */
'use strict'

module.exports = {};