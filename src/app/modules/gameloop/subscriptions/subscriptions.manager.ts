// Vendor Imports 
import { Injectable } from '@angular/core';

// App Imports
import {
    LoggingService
} from '../../../shared/';
import {
    SubscriptionTypeEnum,
    SubscriptionEventTypeEnum
} from '../../session/event-types';
import {
    SessionEventsBroker
} from '../../session/services';
import {
    SubscriptionsManager
} from '../../session/managers';
import {
    GameLoopEventsBroker
} from '../services';
import {
    CurrentTurnSubscriber,
    StartPlayStatusSubscriber
} from './';


@Injectable()
export class GameLoopSubscriptionsManager {

    protected firstRequest: boolean;

    constructor(
        protected logger: LoggingService,
        protected globalEventsBroker: SessionEventsBroker,
        protected subscriptionsMgr: SubscriptionsManager,
        protected eventsBroker: GameLoopEventsBroker,
        protected currentTurnSubscriber: CurrentTurnSubscriber,
        protected startPlaySubscriber: StartPlayStatusSubscriber,
    ) {
        this.init();
    }

    protected init() {
        this.firstRequest = true;
        this.eventsBroker.subscriptions
            .subscribe(this.checkSubscriptions);
    }


    protected checkSubscriptions = () => {
        if (this.firstRequest) {
            this.firstRequest = false;
            this.subscriptionsMgr.addSubscriber(
                SubscriptionTypeEnum.currentframe,
                this.currentTurnSubscriber);

            this.subscriptionsMgr.addSubscriber(
                SubscriptionTypeEnum.startround,
                this.startPlaySubscriber);
        }

        // the subscriptions will already check to 
        // see if the current game they are subscribed 
        // to is the correct one.
        this.globalEventsBroker.newevent_subscriptions({
            type: SubscriptionEventTypeEnum.Init,
            subscriptions: [
                SubscriptionTypeEnum.currentframe,
                SubscriptionTypeEnum.startround]
        });

    }

}
