// Vendor Imports
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


// App Imports
import {
    SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    UserSessionManager,
    GameSessionManager,
    ISessionEventsSubscriber,
    SubscriberResourceManager
} from '../../session';
import { LoggingService } from '../../../shared';
import { GameLoopEventsBroker } from '../services';

/**
 * Services:
 * Subscribes to the games currentFrame node 
 * waiting for changes. 
 * 
 * When notified it will invoke the callback 
 * functions set when it was setup  
 * 
 * this will also navigate the view to the next 
 * appropriate view (drawing/text)
 */
@Injectable()
export class CurrentTurnSubscriber implements ISessionEventsSubscriber {

    /**
     * Used to allow the subscription to avoid calling the 
     * callback when it first subscribes
     * (an event is always emitted as per firebase)
     */
    protected count: number;

    constructor(
        public manager: SubscriberResourceManager,
        protected logger: LoggingService,
        protected gameSession: GameSessionManager,
        protected userSession: UserSessionManager,
        protected eventsBroker: GameLoopEventsBroker) {
    }

    public setupSubscription() {
        this.logger.log('attempting to build current turn status subscription');

        let options: SubscribeOptions = new SubscribeOptions(
            this.gameSession.getGameRef().child('currentFrame'),
            EventTypes.VALUE
        );

        let fbRx = this.manager.setupSubscription(
            this.gameSession.gameId, options);

        if (fbRx) {
            this.count = 0;

            this.manager.subscription = fbRx.getObservable()
                .filter(this.currentTurnEventFilter)
                .subscribe(
                (snapshot: firebase.database.DataSnapshot) => {
                    if (snapshot.exists()) {
                        this.eventsBroker.newevent_submitframe();
                    }
                });
        }

    }

    protected currentTurnEventFilter =
        (snap: firebase.database.DataSnapshot): boolean => {

            if (!snap.exists()) {
                this.logger.error('current turn subscriber - \
         current frame node does not exist!');
                this.manager.unsubscribeListeners();
                return false;
            }

            if (this.count === 0) {
                this.count = 1;
                return false;
            } else {
                return true;
            }

        }

}

