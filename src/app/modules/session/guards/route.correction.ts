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
import { UserSessionManager, GameSessionManager } from '../';
import { GameStatus, IRouteGuardStatus } from 'miablib/miab';
import { LoggingService } from '../../../shared';

@Injectable()
export class RouteCorrectionGuard implements CanActivate, CanActivateChild {

  constructor(
    protected userSession: UserSessionManager,
    protected gameSession: GameSessionManager,
    private router: Router,
    protected logger: LoggingService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    this.logger.log('gameloop route correction canactivate guard.');
    return this.checkGameSession(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.logger.log('gameloop route correction canactivatechild guard.');
    let url: string = state.url;
    return this.checkGameSession(url);
  }

  checkGameSession(url: string): boolean {

    let status = this.initStatus(url);

    this.logger.log('route correction pre-execution status...');
    this.logger.object(status);

    if (!this.gameSession.status) {
      status.route_changed = true;
      status.new_route = '/error';
      status.error_msg = 'game session status undefined!';
    } else {

      switch (this.gameSession.status) {

        case GameStatus.none:
        case GameStatus.err:
          if (url === '/game' || url === '/game/menu') {
            status.route_changed = false;
          } else {
            status.route_changed = true;
            status.new_route = '/game/menu';
          }
          break;

        case GameStatus.hosting:
        case GameStatus.inqueue:
          if (url === '/game/lobby') {
            status.route_changed = false;
          } else {
            status.route_changed = true;
            status.new_route = '/game/lobby';
          }
          break;

        case GameStatus.completed:
          if (url === '/game/completed') {
            status.route_changed = false;
          } else {
            status.route_changed = true;
            status.new_route = '/game/completed';
          }
          break;

        case GameStatus.started:
          if (url.indexOf('activegame') > -1) {
            status.route_changed = false;
          } else {
            status.route_changed = true;
            status.new_route = '/activegame';
          }
          break;

        default:
          status.route_changed = true;
          status.new_route = '/error';
          status.error_msg = 'unknown game session status: '
            + this.gameSession.status;
          break;


      }
    }

    if (status.route_changed) {
      status.result = false;
      this.logger.object(status);
      this.router.navigate([status.new_route]);
      return false;
    } else {
      status.result = true;
    };

    this.logger.object(status);
    return status.result;
  }

  protected initStatus(url: string): IRouteGuardStatus {
    let status: IRouteGuardStatus = {
      guard: 'game route correction guard',
      from: this.router.routerState.snapshot.url,
      to: url,
      result: null,
      condition: 'game session status',
      value: this.gameSession.status,
      route_changed: false,
      new_route: null,
      error_msg: null,
    };

    return status;
  }

}
