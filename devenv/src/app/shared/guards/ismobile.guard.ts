// Vendor Imports
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

// App Imports
import { 
    LoggingService, 
    isMobile 
} from '../';
import { IRouteGuardStatus } from 'miablib/miab';

@Injectable()
export class IsMobileDeviceGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('ismobile device canactivate guard.');
    let status = this.initStatus(state.url);
    this.logger.object(status);
    return status.result;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('ismobile device canactivatechild guard.');
    let status = this.initStatus(state.url);
    this.logger.object(status);
    return status.result;
}

  protected initStatus(url: string): IRouteGuardStatus {
    let mobileDevice = isMobile(this.logger);

    let status: IRouteGuardStatus = {
      guard: 'ismobile device guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: mobileDevice,
      condition: 'ismobile device',
      value: mobileDevice,
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
