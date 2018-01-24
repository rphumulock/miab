// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

// App Imports
import {
    GameState,
} from 'miablib/miab';
import {
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    LoggingService,
    ROUTINGTREE
} from '../../../shared/';
import {
    SessionManagerEventTypeEnum,
} from '../event-types';
import {
    SubscriberResourceManager,
    ISessionEventsSubscriber
} from './';
import {
    GameSessionManager,
} from '../managers';
import {
    SessionEventsBroker
} from '../services';


@Injectable()
export class GameStatusSubscriber implements ISessionEventsSubscriber {

    protected isInitialEvent: boolean;

    constructor(
        public manager: SubscriberResourceManager,
        protected eventsBroker: SessionEventsBroker,
        protected gameSession: GameSessionManager,
        protected logger: LoggingService,
        protected router: Router) {
    }

    public setupSubscription() {
        this.logger.log('attempting to build game status subscription');

        let options: SubscribeOptions = {
            node: this.gameSession.getGameRef().child('gameState'),
            eventType: EventTypes.VALUE,
            preserveSnapshot: true
        };

        let fbRx = this.manager.setupSubscription(
            this.gameSession.gameId, options);

        if (fbRx) {
            this.isInitialEvent = true;

            this.manager.subscription = fbRx.getObservable()
                .subscribe(this.gameStateListenerCallback);
        }
    }


    protected gameStateListenerCallback = (snapshot: firebase.database.DataSnapshot) => {
        if (snapshot.exists()) {
            let status: GameState = snapshot.val();

            let wasInitial = this.isInitialEvent;

            this.isInitialEvent = false;

            this.logger.log('game state subscription status received: ' + status);

            let errMsg = 'Oh no your game session broke.\n' +
                'Resetting and navigating you back to the game menu.';

            switch (status) {

                case GameState.err:
                    // Show error message
                    this.eventsBroker.newevent_error({
                        message: errMsg,
                        redirect: ROUTINGTREE.menu
                    });
                    break;

                case GameState.started:
                    this.eventsBroker.newevent_sessionmanager({
                        type: SessionManagerEventTypeEnum.GameStarted
                    });
                    break;

                case GameState.complete:
                    if (wasInitial) {
                        this.router.navigate([ROUTINGTREE.completed]);
                    }
                    break;

                case GameState.init:
                    if (wasInitial) {
                        this.router.navigate([ROUTINGTREE.lobby]);
                    }
                    break;

                case GameState.ready:
                    if (wasInitial) {
                        this.router.navigate([ROUTINGTREE.lobby]);
                    }

                    this.gameSession.readyToStartGame = true;
                    break;
            }

        }
    }

}
