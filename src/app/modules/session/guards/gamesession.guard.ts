// Vendor Imports
import { Injectable } from '@angular/core';
import {
  CanActivate, Router, Route,
  CanActivateChild, CanLoad,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

// App Imports
import {
  SessionBrokerEventTypeEnum,
  RedirectAction,
  SessionEventsBroker,
  GameSessionManager
} from '../';
import {
  LoggingService,
} from '../../../shared';
import { IRouteGuardStatus } from 'miablib/miab';

@Injectable()
export class GameSessionGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    protected gameSession: GameSessionManager,
    protected eventsBroker: SessionEventsBroker,
    private router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('gamesession canactivate guard invoked');
    return this.checkGameSession(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('gamesession canactivatechild guard invoked');
    return this.checkGameSession(state.url);
  }

  canLoad(route: Route) {
    this.logger.log('gamesession canload guard invoked');
    return this.checkGameSession(`/${route.path}`);
  }

  checkGameSession(url: string): boolean {

    let status = this.initStatus(url);

    if (!status.result) {
      status.error_msg = 'Requesting new game session';
      this.logger.object(status);

      this.eventsBroker.newevent_redirectqueue({
        source: 'Game Session Guard',
        action: RedirectAction.NewRedirect,
        'url': url
      });

      this.eventsBroker.newevent_sessionbroker({
        type: SessionBrokerEventTypeEnum.Init,
        showModal: true
      });

    }

    this.logger.object(status);
    return status.result;

  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'game session guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: this.gameSession.isInitialized,
      condition: 'game session initialized/status',
      value: this.gameSession.isInitialized,
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
