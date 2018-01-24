// Vendor Imports
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


// App Imports
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    UserSessionManager,
    GameSessionManager,
    SessionEventsSubscriber,
} from '../../session';
import { LoggingService, FirebaseProjectService } from '../../../shared';
import { GameLoopEventsBroker } from './index';

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
export class CurrentTurnSubscriber extends SessionEventsSubscriber {


    /** 
     * The game id for whom this game turn subscription is set to 
     */
    protected subscriptionGameId: string;

    /**
     * Used to allow the subscription to avoid calling the 
     * callback when it first subscribes
     * (an event is always emitted as per firebase)
     */
    protected count: number;

    constructor(
        protected logger: LoggingService,
        protected gameSession: GameSessionManager,
        protected userSession: UserSessionManager,
        protected eventsBroker: GameLoopEventsBroker,
        protected projectsMgr: FirebaseProjectService) {
        super();
    }

    public setupSubscription() {

        let isSameGame =
            this.subscriptionGameId === this.gameSession.gameId;

        if (this.subscription && isSameGame) {
            return;
        }

        this.unsubscribeListeners();

        this.subscriptionGameId = this.gameSession.gameId;

        this.count = 0;

        let options: SubscribeOptions = new SubscribeOptions(
            this.gameSession.getGameRef().child('currentFrame'),
            EventTypes.VALUE
        );

        let fbRx = new FirebaseObservable(
            this.projectsMgr.default.app, options);

        this.subscription = fbRx.getObservable().filter(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    this.logger.error('current turn subscriber - \
                     current frame node does not exist!');
                    this.unsubscribeListeners();
                    return false;
                }

                if (this.count === 0) {
                    this.count = 1;
                    return false;
                } else {
                    return true;
                }
            })
            .subscribe(
            (snapshot: firebase.database.DataSnapshot) => {
                if (snapshot.exists()) {
                    this.eventsBroker.newevent_submitframe();
                }
            });

    }

}

