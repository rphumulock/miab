// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

// App Imports
import {
    StartPlayStatus,
} from 'miablib/miab';
import {
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    ISessionEventsSubscriber,
    SubscriberResourceManager,
    GameSessionManager,
} from '../../session';
import {
    LoggingService
} from '../../../shared/';
import {
    GameLoopEventsBroker
} from '../services';


@Injectable()
export class StartPlayStatusSubscriber implements ISessionEventsSubscriber {

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
        public manager: SubscriberResourceManager,
        protected logger: LoggingService,
        protected gameSession: GameSessionManager,
        protected eventsBroker: GameLoopEventsBroker) {
    }

    public setupSubscription() {

        this.logger.log('attempting to build start play/round subscription');

        let options: SubscribeOptions = new SubscribeOptions(
            this.gameSession.getGameRef().child('gameLoopStatus/startPlay'),
            EventTypes.VALUE
        );

        let fbRx = this.manager.setupSubscription(
            this.gameSession.gameId, options);

        if (fbRx) {
            this.count = 0;

            this.manager.subscription = fbRx.getObservable()
                .filter(this.startRoundEventFilter)
                .subscribe(
                (snapshot: firebase.database.DataSnapshot) => {
                    this.eventsBroker.newevent_startround();
                });

        }

    }

    protected startRoundEventFilter =
        (snap: firebase.database.DataSnapshot): boolean => {
            if (!snap.exists()) {
                this.logger.error('start play subscriber - \
             start play node does not exist!');
                this.manager.unsubscribeListeners();
                return false;
            }

            let startPlayStatus = snap.val();
            return startPlayStatus === StartPlayStatus.start;
        }

}

