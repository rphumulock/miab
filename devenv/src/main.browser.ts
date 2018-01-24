import './polyfills.browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';

export const platformBrowserRef = platformBrowserDynamic();

declare global {
  interface Window {
    rootInjector: any
  }
};

platformBrowserRef.bootstrapModule(AppModule)
  .then(
  module => {
    console.log('exporting app root injector');
    window.rootInjector = module.injector;
  })
  .catch(err => console.error(err));

