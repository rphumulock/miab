// Vendor Imports 
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

// App Imports
import {
    OnlineStatus
} from 'miablib/miab';
import {
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    LoggingService,
    FirebaseProjectService
} from '../../../shared/';
import {
    SubscriberResourceManager,
    ISessionEventsSubscriber,
} from './index';
import {
    UserSessionManager,
} from '../managers';
import {
    SessionEventsBroker,
} from '../services';

@Injectable()
export class UserPresenceSubscriber implements ISessionEventsSubscriber {

    protected online: boolean;
    protected streamUserRef: firebase.database.Reference;

    constructor(
        protected logger: LoggingService,
        protected firebaseProjs: FirebaseProjectService,
        public manager: SubscriberResourceManager,
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
    ) {
    }

    public setupSubscription() {
        this.logger.log('attempting to build user persistence subscription');

        let options: SubscribeOptions = new SubscribeOptions(
            this.firebaseProjs.default.db.ref('.info/connected'),
            EventTypes.VALUE,
        );
        options.preserveSnapshot = true;

        let fbRx = this.manager.setupSubscription(
            this.userSession.userId, options);

        if (fbRx) {
            this.streamUserRef = this.userSession.getUserRef();

            this.manager.subscription = fbRx.getObservable()
                .subscribe(this.userPresenceCallback);
        }

    }

    /**
     * This is the callback for the user presense events... network connectivity...
     * 
     * It on an active/online connection it will give the server a function 
     * to execute if the server notices it has lost connection to the client.
     * 
     * Otherwise it will write "offline"" to its presence node. (which if actuall offline
     * will not write to the database (hense the function it gave to the server earlier.))
     */
    protected userPresenceCallback = (snapshot: firebase.database.DataSnapshot) => {
        if (snapshot.exists()) {
            this.streamUserRef.onDisconnect()
                .update({ 'presence/connection': { status: OnlineStatus.offline } });
            this.streamUserRef
                .update({ 'presence/connection': { status: OnlineStatus.online } });
            this.online = true;
        } else {
            this.streamUserRef
                .update({ 'presence/connection': { status: OnlineStatus.offline } });
            this.online = false;
        }
    }

}
