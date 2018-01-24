// Vendor Imports
import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

// App Imports
import { IRouteGuardStatus } from 'miablib/miab';
import {
  LoggingService,
  ROUTINGTREE
} from '../../../shared';
import {
  AuthTypeEnum
} from '../event-types';
import {
  SessionEventsBroker,
  UserSessionManager,
} from '../';


@Injectable()
export class UserSessionGuard implements CanActivate, CanActivateChild {

  constructor(
    protected eventsBroker: SessionEventsBroker,
    protected userSession: UserSessionManager,
    protected router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('usersession canactivate guard invoked');
    return this.checkUserSession(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('usersession canactivatechild guard invoked');
    return this.checkUserSession(state.url);
  }

  checkUserSession(url: string): boolean {

    let status = this.initStatus(url);

    if (!status.result) {

      let onPageLanding =
        status.from.length === 0 ||
        status.from.indexOf('landing') > -1;

      if (onPageLanding) {
        status.error_msg = 'Requesting anonymous user session';
        this.eventsBroker.newevent_authserviceevent({
          type: AuthTypeEnum.anonymous,
          redirect: url
        });
      } else {
        this.router.navigate([ROUTINGTREE.login, { redir: url }]);
      }
    }

    this.logger.object(status);
    return status.result;

  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'user session guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: this.userSession.isInitialized,
      condition: 'user session is initialized',
      value: this.userSession.isInitialized,
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
