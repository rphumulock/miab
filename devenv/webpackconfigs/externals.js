/**
  * The externals configuration option provides a way of excluding dependencies from the output bundles. 
  * Instead, the created bundle relies on that dependency to be present in the consumer's environment. 
  * This feature is typically most useful to library developers, 
  * however there are a variety of applications for it.
  * https://github.com/webpack/webpack/tree/master/examples/externals
  * 
  * The official documentation that I think is complete
       externals: [
           {
               a: false, // a is not external
               b: true, // b is external (require("b"))
               "./c": "c", // "./c" is external (require("c"))
               "./d": "var d" // "./d" is external (d)
           },
           // Every non-relative module is external
           // abc -> require("abc")
           /^[a-z\-0-9]+$/,
           function(context, request, callback) {
               // Every module prefixed with "global-" becomes external
               // "global-abc" -> abc
               if(/^global-/.test(request))
                   return callback(null, "var " + request.substr(7));
               callback();
           },
           "./e" // "./e" is external (require("./e"))
       ]
  * 
  */
'use strict';

module.exports = {}
