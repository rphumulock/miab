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
import { IRouteGuardStatus } from 'miablib/miab';
import { NavOptions, NavMenuService } from '../';
import { LoggingService } from '../../../shared';

/**
 * This routing guard is responsible for enabling the navigation,
 * settings, and footer routes to remove the sites menus
 */
@Injectable()
export class HideFooter implements CanActivate, CanActivateChild {

  constructor(
    protected navService: NavMenuService,
    private router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('hide footer canactivate guard.');
    return this.hideFooter(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('hide footer  canactivatechild guard.');
    return this.hideFooter(state.url);
  }

  protected hideFooter(url: string): boolean {
    this.navService.update(NavOptions.HideFooter);
    let status = this.initStatus(url);
    this.logger.object(status);
    return status.result;
  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'hide footer guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: true,
      condition: 'always true',
      value: true,
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
