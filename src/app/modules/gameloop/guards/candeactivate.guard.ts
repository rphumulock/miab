// Vendor Imports
import { Injectable } from '@angular/core';
import {
    CanDeactivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';

// App Imports
import {
    IRouteGuardStatus
} from 'miablib/miab';
import { LoggingService, ROUTINGTREE } from '../../../shared';
import { AbstractGameTurnComponent } from '../abstract.component';
import { GameLoopManager } from '../services/index';
import {
    SessionEventsBroker,
    SubscriptionEventTypeEnum,
    SubscriptionTypeEnum
} from '../../session';

@Injectable()
export class GameLoopCanDeactivate implements CanDeactivate<AbstractGameTurnComponent> {

    constructor(
        protected gameloopManager: GameLoopManager,
        protected globalEventsBroker: SessionEventsBroker,
        protected logger: LoggingService,
        protected router: Router) { }

    canDeactivate(component: AbstractGameTurnComponent,
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        this.logger.log('gameloop candeactivate guard invoked');

        let url: string = state.url;
        let status = this.initStatus(url);

        let test = 1;
        let continueTests = true;

        while (continueTests && test < 6) {
            switch (test) {
                case 1:
                    let isError =
                        url.indexOf('error') > -1 ||
                        this.gameloopManager.errorReceived;
                    if (isError) {
                        status.result = true;
                        status.value = 'error';
                        // this is taken care of by the session reset
                        // this.releaseSubscriptions();
                        continueTests = false;
                    }
                    break;
                case 2:
                    if (!this.gameloopManager.frameSubmitted) {
                        status.result = false;
                        status.error_msg = 'navigating away from active game not allowed!';
                        continueTests = false;
                    }
                    break;
                case 3:
                    if (url.indexOf('activegame') > -1) {
                        status.result = true;
                        status.value = 'next';
                        continueTests = false;
                    }
                    break;
                case 4:
                    // if the frame was submitted; this is not an error;
                    // and we are not navigating to the "next" frame
                    // then we have to assume the game is complete. 
                    if (url.indexOf('completed') === -1) {
                        let msg = 'Cannot leave activegame to \
                    anywhere else besides completed games route!';

                        status.result = false;
                        status.error_msg = msg;
                        status.route_changed = true;
                        status.value = 'complete';
                        status.new_route = ROUTINGTREE.completed;
                        this.releaseSubscriptions();
                        continueTests = false;
                    }
                    break;
                case 5:
                    this.releaseSubscriptions();
                    status.result = true;
                    status.value = 'complete';
                    continueTests = false;
                    break;
                default:
                    continueTests = false;
                    throw Error('failed to increment test variable!');
            }
            // increment test counter
            test++;
        }

        if (status.error_msg) {
            this.logger.error(status.error_msg);
        }

        this.logger.object(status);

        if (status.new_route) {
            this.router.navigate([status.new_route]);
        }

        return status.result;

    }

    protected releaseSubscriptions() {
        // release subscriptions
        this.globalEventsBroker.newevent_subscriptions({
            type: SubscriptionEventTypeEnum.Reset,
            subscriptions: [SubscriptionTypeEnum.startround,
            SubscriptionTypeEnum.currentframe]
        });
    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'game loop candeactivate guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'error or frame submitted',
            value: false,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}

