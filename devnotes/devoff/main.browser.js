"use strict";
require('./polyfills.browser');
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var app_module_1 = require('./app/app.module');
var core_1 = require('@angular/core');
exports.platformBrowserRef = platform_browser_dynamic_1.platformBrowserDynamic();
if (process.env.ENV === 'production') {
    console.log('Running Production Mode');
    core_1.enableProdMode();
}
exports.platformBrowserRef.bootstrapModule(app_module_1.AppModule)
    .catch(function (err) { return console.error(err); });
//# sourceMappingURL=main.browser.js.map