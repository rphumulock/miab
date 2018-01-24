/**
 * An AOT-compiled app bootstraps differently, using 
 * platformBrowser instead of platformBrowserDynamic 
 * and using the factory that is created by
 * pre-compiling the app module.
 * 
 * https://angular.io/docs/ts/latest/guide/universal.html#!#configuration-aot
 */
import { platformBrowser} from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppModuleNgFactory } from '../aot/src/app/app.module.ngfactory';

declare var process;
if (process.env.ENV === 'production') {
    // console.log('Production Mode');
    enableProdMode();
}

console.log('Running AOT compilied');
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
