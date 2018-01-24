// Polyfills
"use strict";
require('ie-shim'); // Internet Explorer 9 support
require('es5-shim');
require('es6-shim');
require('raf'); // Safari Requirement 
require('promise-polyfill');
// import 'core-js/es6';
// Added parts of es6 which are necessary for your project or your browser support requirements.
require('core-js/es6/symbol');
require('core-js/es6/object');
require('core-js/es6/function');
require('core-js/es6/parse-int');
require('core-js/es6/parse-float');
require('core-js/es6/number');
require('core-js/es6/math');
require('core-js/es6/string');
require('core-js/es6/date');
require('core-js/es6/array');
require('core-js/es6/regexp');
require('core-js/es6/map');
require('core-js/es6/set');
require('core-js/es6/weak-map');
require('core-js/es6/weak-set');
require('core-js/es6/typed');
require('core-js/es6/reflect');
// see issue https://github.com/AngularClass/angular2-webpack-starter/issues/709
// import 'core-js/es6/promise';
require('core-js/es7/reflect');
require('zone.js/dist/zone');
//import 'zone.js/dist/long-stack-trace-zone';
/**
 * Because this bundle file will load first,
 * polyfills.ts is also a good place to configure the
 * browser environment for production or development.
 *
 * https://angular.io/docs/ts/latest/guide/webpack.html#!#entries-outputs
 */
if (process.env.NODE_ENV === 'production') {
}
else {
    // Development and test
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');
}
//# sourceMappingURL=polyfills.browser.js.map