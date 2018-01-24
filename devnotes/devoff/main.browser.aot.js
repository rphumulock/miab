"use strict";
/**
 * An AOT-compiled app bootstraps differently, using
 * platformBrowser instead of platformBrowserDynamic
 * and using the factory that is created by
 * pre-compiling the app module.
 *
 * https://angular.io/docs/ts/latest/guide/universal.html#!#configuration-aot
 */
var platform_browser_1 = require('@angular/platform-browser');
var core_1 = require('@angular/core');
var app_module_ngfactory_1 = require('./app/app.module.ngfactory');
exports.platformRef = platform_browser_1.platformBrowser();
core_1.enableProdMode(); // test
if (process.env.ENV === 'production') {
    console.log("PROD MODE");
    core_1.enableProdMode();
}
console.log('Running AOT compilied');
exports.platformRef.bootstrapModuleFactory(app_module_ngfactory_1.AppModuleNgFactory);
//# sourceMappingURL=main.browser.aot.js.map