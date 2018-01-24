// Vendor Imports 
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

// App Imports
import {
    GameStatus
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
    UserSessionManager,
} from '../managers';
import {
    SessionEventsBroker
} from '../services';


@Injectable()
export class UserStatusSubscriber implements ISessionEventsSubscriber {

    constructor(
        public manager: SubscriberResourceManager,
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
        protected logger: LoggingService) {
    }

    public setupSubscription() {
        this.logger.log('attempting to build user session status subscription');

        let options: SubscribeOptions = new SubscribeOptions(
            this.userSession.getUserRef().child('game/status'),
            EventTypes.VALUE
        );
        options.preserveSnapshot = true;
        options.existsOnly = true;

        let fbRx = this.manager.setupSubscription(
            this.userSession.userId, options);

        if (fbRx) {
            this.manager.subscription = fbRx.getObservable()
                .subscribe(this.userStatusCallback);
        }
    }

    protected userStatusCallback = (snapshot: firebase.database.DataSnapshot) => {

        if (snapshot.exists()) {

            let status: GameStatus = snapshot.val();

            this.logger.log('user game subscription status received: ' + status);

            let errMsg = 'Oh no your game session broke.\n' +
                'Refreshing session and navigating you back to the game menu.';

            switch (status) {
                case GameStatus.err:
                    this.eventsBroker.newevent_error({
                        message: errMsg,
                        redirect: ROUTINGTREE.menu
                    });
                    break;

                case GameStatus.completed:
                    this.eventsBroker.newevent_sessionmanager({
                        type: SessionManagerEventTypeEnum.GameCompleted
                    });
            }
        }

    }

}
