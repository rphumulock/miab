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
import { UserSessionManager, GameSessionManager } from '../../session';
import { IRouteGuardStatus } from 'miablib/miab';
import { LoggingService } from '../../../shared';

@Injectable()
export class RouteCorrectionGuard implements CanActivate, CanActivateChild {

  constructor(
    protected userSession: UserSessionManager,
    protected gameSession: GameSessionManager,
    private router: Router,
    protected logger: LoggingService) {
      //this.logger.log('account route correction guard instantiated');
      //this.logger.object(userSession);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    this.logger.log('accounts route correction canactivate guard.');
    return this.validateRoute(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('accounts route correction canactivatechild guard.');
    let url: string = state.url;
    return this.validateRoute(url);
  }

  validateRoute(url: string): boolean {

    let status = this.initStatus(url);
    //this.logger.log('pre-route correction status');
    //this.logger.object(status);
    //this.logger.log('isanonymous: ' + this.userSession.isAnonymous);
    //let val = this.userSession.isInitialized;
    //this.logger.log('isinitialized: ' + val);
    //this.logger.object(this.userSession);
    if (this.userSession.isInitialized !== true) {

      if (url === '/accounts/profile') {
        status.route_changed = true;
        status.new_route = '/accounts/login';
        status.error_msg = 'no logged in user for profile page!';
      } else {
        status.route_changed = false;
      }

    } else {

      if (this.userSession.isAnonymous) {

        let isRestPassword = url.indexOf('/accounts/reset') !== -1;
        isRestPassword = false; // for testing the reset page;
        let isVerifyEmail = url.indexOf('/accounts/verify') !== -1;

        if (isRestPassword || isVerifyEmail) {
          status.route_changed = true;
          status.new_route = '/accounts/signup';
          status.error_msg = 'cannot reset anonymous user!';
        } else {
          status.route_changed = false;
        }

      } else {

        switch (url) {
          case '/accounts/login':
          case '/accounts/signup':
            status.route_changed = true;
            status.new_route = '/accounts/profile';
            status.error_msg = 'user already logged in!';
            break;

          case '/accounts/reset':
          case '/accounts/reset/request':
          case '/accounts/reset/finish':
          case '/accounts/profile':
            status.route_changed = false;
            break;
        }

      }
    }

    if (status.route_changed) {
      status.result = false;
      this.logger.object(status);
      this.router.navigate([status.new_route]);
      return false;
    };

    status.result = true;
    this.logger.object(status);
    return true;
  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'accounts routecorrection guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: false,
      condition: 'isinitialized & isanonymous',
      value: {
        isinitialized: this.userSession.isInitialized,
        isanonymous: this.userSession.isAnonymous
      },
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
