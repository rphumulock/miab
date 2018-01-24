// Vendor Imports
import { Injectable } from '@angular/core';
import {
    CanActivate, Router, Route,
    CanActivateChild, CanLoad,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';

// App Imports
import {
    RedirectAction,
    AuthTypeEnum
} from '../../session/event-types';
import {
    SessionEventsBroker,
    UserSessionManager,
    GameSessionManager,
} from '../../session';
import {
    LoggingService,
    FirebaseAuthService
} from '../../../shared';
import { IRouteGuardStatus } from 'miablib/miab';

@Injectable()
export class CurrentLoginGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        protected authService: FirebaseAuthService,
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
        protected gameSession: GameSessionManager,
        protected router: Router,
        protected logger: LoggingService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.logger.log('accounts currentlogin canactivate guard invoked');
        return this.checkUserLogin(state.url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.logger.log('accounts currentlogin canactivatechild guard invoked');
        return this.checkUserLogin(state.url);
    }

    canLoad(route: Route) {
        this.logger.log('accounts currentlogin canload guard invoked');
        return this.checkUserLogin(`/${route.path}`);
    }

    checkUserLogin(url: string): boolean {
        let status = this.initStatus(url);

        let loggedInAndSetup =
            this.authService.loggedIn && this.userSession.isInitialized;

        if (!loggedInAndSetup) {
            this.eventsBroker.newevent_redirectqueue({
                source: 'Current Login Guard',
                'url': url,
                action: RedirectAction.NewRedirect,
                defer: true
            });

            this.eventsBroker.newevent_authserviceevent({
                type: AuthTypeEnum.current
            });
        }

        this.logger.object(status);
        return true;
    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'accounts currentlogin guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'user authenticated',
            value: null,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}
