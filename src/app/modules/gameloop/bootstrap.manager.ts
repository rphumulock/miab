// Vendor Imports
import {
    Injectable
} from '@angular/core';


// App Imports
import {
    GameTurnDetailsService,
    GameLoopManager
} from './services';
import {
    GameLoopSubscriptionsManager
} from './subscriptions';

@Injectable()
export class GameLoopBootstrapManager {

    constructor(
        protected manager: GameLoopManager,
        protected detailsService: GameTurnDetailsService,
        protected subscriptionsMgr: GameLoopSubscriptionsManager) {}

}

