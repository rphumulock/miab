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
    IRouteGuardStatus
} from 'miablib/miab';
import { LoggingService } from '../../../shared';
import { RedirectAction, SessionEventsBroker } from '../../session/index';
import { GameLoopEventsBroker, GameLoopManager } from '../services';


@Injectable()
export class GameLoopCanActivate implements CanActivate, CanActivateChild {

    protected isLatestDetails: boolean;

    constructor(
        protected logger: LoggingService,
        protected router: Router,
        protected gameloopManager: GameLoopManager,
        protected globalEventsBroker: SessionEventsBroker,
        protected eventsBroker: GameLoopEventsBroker) {
    }

    protected init() {
        // register new game details returned
        this.eventsBroker.detailspublished.subscribe(() => {
            this.isLatestDetails = true;
        });

        this.eventsBroker.gameRouteLanded.subscribe(() => {
            this.isLatestDetails = false;
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.logger.log('gameloop canactivate guard invoked');
        return this.navigateToGameTurn(state.url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.logger.log('gameloop canactivatechild guard invoked');
        return this.navigateToGameTurn(state.url);
    }

    protected navigateToGameTurn(url: string): boolean {

        let status = this.initStatus(url);

        if (!status.result) {
            //  queue the route
            this.globalEventsBroker.newevent_redirectqueue({
                source: 'Gameloop CanActivate Guard',
                action: RedirectAction.NewRedirect,
                url: url
            });

            // request the new details
            this.eventsBroker.newevent_detailsrequest();

        } else {

            let currentTurn =
                this.gameloopManager.latestGameTurnDetails.currentTurn;

            this.logger.log(
                'validating gameloop route' +
                '\ncurrent turn: ' + currentTurn +
                '\nurl: ' + url);

            let isEven = currentTurn % 2;

            if (isEven) {
                if (url.indexOf('activegame/2') === -1) {
                    status.route_changed = true;
                    status.new_route = '/activegame/2';
                    status.result = false;
                }
            } else {
                if (url.indexOf('activegame/1') === -1) {
                    status.route_changed = true;
                    status.new_route = '/activegame/1';
                    status.result = false;
                }
            }
        }

        this.logger.object(status);

        if (status.new_route) {
            this.router.navigate([status.new_route]);
            return false;
        }

        return status.result;

    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'gameloop canactivate guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: this.isLatestDetails,
            condition: 'latest game turn details received',
            value: this.isLatestDetails,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}
