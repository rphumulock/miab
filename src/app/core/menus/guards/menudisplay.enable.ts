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
 * settings, and footer routes to display the sites menus
 */
@Injectable()
export class EnableSiteMenus implements CanActivate, CanActivateChild {

  constructor(
    protected navService: NavMenuService,
    private router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('menus display enable canactivate guard.');
    return this.showMenu(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('menus display enable canactivatechild guard.');
    return this.showMenu(state.url);
  }

  protected showMenu(url: string): boolean {
    this.navService.show();
    let status = this.initStatus(url);
    this.logger.object(status);
    return status.result;
  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'enable/show menu display guard',
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