// Vendor Imports
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable } from 'rxjs';

// App Imports
import { LoggingService } from '../shared';

@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {

  constructor(
    protected logger: LoggingService) { }

  preloadedModules: string[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      // add the route path to the preloaded module array
      this.preloadedModules.push(route.path);

      // log the route path to the console
      this.logger.log('Preloading: ' + route.path);

      return load();
    } else {
      return Observable.of(null);
    }
  }
}