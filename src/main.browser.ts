import './polyfills.browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';


export const platformBrowserRef = platformBrowserDynamic();

if (process.env.ENV === 'production') {
  console.log('Running Production Mode');
  enableProdMode();
}

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

/*
export function main() {
  return platformBrowserRef.bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

main();
*/

// support async tag or hmr
/*
switch (document.readyState) {
  case 'interactive':
  case 'complete':
    main();
    break;
  case 'loading':
  default:
    document.addEventListener('DOMContentLoaded', () => main());
}
*/
