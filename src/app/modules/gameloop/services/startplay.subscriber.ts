// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

// App Imports
import {
    StartPlayStatus,
} from 'miablib/miab';
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    SessionEventsSubscriber,
    GameSessionManager,
} from '../../session';
import {
    LoggingService,
    FirebaseProjectService
} from '../../../shared/';
import {
    GameLoopEventsBroker
} from './';


@Injectable()
export class StartPlayStatusSubscriber extends SessionEventsSubscriber {

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

        let options: SubscribeOptions = new SubscribeOptions(
            this.gameSession.getGameRef().child('gameLoopStatus/startPlay'),
            EventTypes.VALUE
        );

        let fbRx = new FirebaseObservable(
            this.projectsMgr.default.app, options);

        this.subscription = fbRx.getObservable().filter(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    this.logger.error('start play subscriber - \
                     start play node does not exist!');
                    this.unsubscribeListeners();
                    return false;
                }

                let startPlayStatus = snap.val();
                return startPlayStatus === StartPlayStatus.start;
            })
            .subscribe(
            (snapshot: firebase.database.DataSnapshot) => {
                this.eventsBroker.newevent_startround();
            });

    }

}

