// Vendor Imports 
import { Injectable } from '@angular/core';

// App Imports
import { LoggingService } from '../../../shared';
import {
    SubscriptionType,
    SubscriptionTypeEnum,
    SubscriptionEventTypeEnum,
    SessionEventsBroker,
    ISessionEventsSubscriber,
    SubscriptionsManagementEvent
} from '../';



/**
 * This class is responsible for maintaing game session state
 * data throughout the application. 
 * 
 * This class also provides functionality to re-establish 
 */
@Injectable()
export class SubscriptionsManager {

    protected collection: Map<SubscriptionType, ISessionEventsSubscriber>;

    protected gameSubcriptions = [
        SubscriptionTypeEnum.gamestatus,
        SubscriptionTypeEnum.currentframe,
        SubscriptionTypeEnum.startround
    ];

    constructor(
        protected eventsBroker: SessionEventsBroker,
        protected logger: LoggingService) {
        this.eventsBroker.subscriptions.subscribe(this.handleNewEvent);
        this.collection = new Map<SubscriptionType, ISessionEventsSubscriber>();
    }

    public addSubscriber(
        type: SubscriptionType, subscriber: ISessionEventsSubscriber) {
        this.collection.set(type, subscriber);
    }

    public resetAndRemoveSubscriber(type: SubscriptionType) {
        if (this.collection.has(type)) {
            this.collection.get(type).manager.unsubscribeListeners();
            this.collection.delete(type);
        }
    }

    protected handleNewEvent = (event: SubscriptionsManagementEvent) => {

        switch (event.type) {
            case SubscriptionEventTypeEnum.Init:
                this.initSubscriptions(event.subscriptions);
                break;

            case SubscriptionEventTypeEnum.Reset:
                this.resetSubscriptions(event.subscriptions);
                break;
        }
    }

    protected initSubscriptions(targets: Array<SubscriptionType>) {
        let initAll = targets.find(val => { return val === SubscriptionTypeEnum.all; });

        if (initAll) {
            this.logger.error('cannot indiscriminatly init all session subscriptions');
            return;
        }

        let iniGameSpecific = targets.find(val => { return val === SubscriptionTypeEnum.currentgame; });

        if (iniGameSpecific) {
            this.logger.error('cannot indiscriminatly init all game specific session subscriptions');
            return;
        }

        targets.forEach(
            key => {
                if (this.collection.has(key)) {
                    this.logger.object('subscriber found for init: ' + key);
                    let subscription = this.collection.get(key);
                    this.logger.object(subscription);
                    subscription.setupSubscription();
                }
            });
    }

    protected resetSubscriptions(targets: Array<SubscriptionType>) {

        let resetAll = targets.find(val => { return val === SubscriptionTypeEnum.all; });

        if (resetAll) {
            this.logger.log('resetting all session subscriptions');
            this.collection.forEach(
                (subscription, key) => {
                    this.logger.object('subscriber found for reset: ' + key);
                    this.logger.object(subscription);
                    subscription.manager.unsubscribeListeners();
                });

            return;
        }

        let resetGameSpecific = targets.find(val => { return val === SubscriptionTypeEnum.currentgame; });

        if (resetGameSpecific) {
            this.logger.log('resetting all game specific session subscriptions');
            this.gameSubcriptions.forEach(
                key => {
                    if (this.collection.has(key)) {
                        this.logger.object('subscriber found for reset: ' + key);
                        let subscription = this.collection.get(key);
                        this.logger.object(subscription);
                        subscription.manager.unsubscribeListeners();
                    }
                });
            return;
        }

        targets.forEach(
            key => {
                if (this.collection.has(key)) {
                    this.logger.object('subscriber found for reset: ' + key);
                    let subscription = this.collection.get(key);
                    this.logger.object(subscription);
                    subscription.manager.unsubscribeListeners();
                }
            });

    }


}




