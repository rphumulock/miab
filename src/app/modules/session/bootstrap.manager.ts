// Vendor Imports 
import { Injectable, Inject, forwardRef } from '@angular/core';

// App Imports
import {
    SubscriptionTypeEnum,
    AuthTypeEnum,
} from './event-types';
import {
    SessionEventsBroker
} from './services';
import {
    SessionErrorsService,
    AuthEventsService,
    RedirectQueueManager,
} from './services';
import {
    SubscriptionsManager,
} from './managers';
import {
    GameSessionBroker
} from './requestservices'
import {
    UserStatusSubscriber,
    GameStatusSubscriber,
    UserPresenceSubscriber,
} from './subscriptions';

/**
 * Responsible for making a dependency
 * injection requests to instantiate 
 * any global app root services/classes
 * that need to run from the begining 
 * of the application
 */
@Injectable()
export class SessionBootstrapManager {

    constructor(
        protected eventsBroker: SessionEventsBroker,
        protected redirectQueue: RedirectQueueManager,
        protected errorService: SessionErrorsService,
        protected authService: AuthEventsService,
        protected sessionBroker: GameSessionBroker,
        protected subscriptionsMgr: SubscriptionsManager,
        // this makes a DI request for the user sesssion manager
        protected userStatusSubscriber: UserStatusSubscriber,
        // this makes a DI request for the game sesssion manager
        protected gameStatusSuscriber: GameStatusSubscriber,
        protected userPresenceSubscriber: UserPresenceSubscriber,
    ) {

        this.registerSessionSubscribers();

        this.eventsBroker.newevent_authserviceevent({
            type: AuthTypeEnum.current,
            background: true
        });
    }

    protected registerSessionSubscribers() {

        this.subscriptionsMgr.addSubscriber(
            SubscriptionTypeEnum.gamestatus, this.gameStatusSuscriber);

        this.subscriptionsMgr.addSubscriber(
            SubscriptionTypeEnum.userstatus, this.userStatusSubscriber);

        this.subscriptionsMgr.addSubscriber(
            SubscriptionTypeEnum.userpresence, this.userPresenceSubscriber);

    }





}





