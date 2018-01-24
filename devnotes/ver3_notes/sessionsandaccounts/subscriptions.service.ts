// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

// App Imports
import {
    StreamUser,
    GameStatus,
    OnlineStatus,
    GameState,
    ConnectionType
} from 'miablib/miab';
import { FirebaseProjectService } from '../firebaseutils';
import { UserSessionService } from './usersession.service';
import { GameSessionService } from './gamesession.service';
import { SessionErrorsService } from './sessionerrors.service';
import { FirebaseObservable, SubscribeOptions, EventTypes } from 'miablib/firebaseutil';
import { LoggingService } from '../../shared/';

@Injectable()
export class SubscriptionsService {

    protected gameSession: GameSessionService;
    protected presenceRef: firebase.database.Reference;
    protected presenceSubscription;
    protected gameStateSubscription;
    protected userGameStatusSubscription;
    protected online: boolean;
    protected modalErrMsg: string;

    constructor(
        protected firebaseProjs: FirebaseProjectService,
        protected userSession: UserSessionService,
        protected sessionErrors: SessionErrorsService,
        protected logger: LoggingService,
        protected router: Router) {
        this.modalErrMsg = 'Oh no your game session broke.\n' +
            'Resetting and Navigating you back to the Game menu.';
    }

    public unsubscribeSessionListeners() {
        if (this.gameStateSubscription) {
            // Unsubscribe the gamestate listener
            this.gameStateSubscription.unsubscribe();
        }

        if (this.userGameStatusSubscription) {
            // Unsubscribe the user game status listener
            this.userGameStatusSubscription.unsubscribe();
        }
    }

    public setupLiveUserPresence(
        user: StreamUser,
        gameSessionSvc: GameSessionService) {

        this.logger.log('setting up user persistence subscription');


        this.gameSession = gameSessionSvc;
        this.sessionErrors.setGameSession(gameSessionSvc);

        if (user.presence.connection) {

            switch (user.presence.connection) {

                case ConnectionType.created:
                    this.gameSession.getUserRef().update({ presence: { connection: ConnectionType.initial } });
                    break;

                case ConnectionType.initial:
                    this.gameSession.getUserRef().update({ presence: { connection: ConnectionType.reconnect } });
                    break;

                default:
                    // Doesn't matter...
                    break;
            }
        }

        this.buildUserPresenceSubscription();
    }

    /**
     * This function will subscribe to the local copy of a node
     * that the user has access to that tells it its online/offline 
     * mode based on network events locally on the client.
     */
    protected buildUserPresenceSubscription() {

        this.presenceRef = this.firebaseProjs.default.db.ref('.info/connected');

        let rxOptions: SubscribeOptions = new SubscribeOptions(
            this.presenceRef, EventTypes.VALUE);
        rxOptions.preserveSnapshot = true;

        let fbRx = new FirebaseObservable(this.firebaseProjs.default.app, rxOptions);

        this.presenceSubscription = fbRx.getObservable().subscribe(this.presenceSubscriptionCallback);
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
    protected presenceSubscriptionCallback = (snapshot: firebase.database.DataSnapshot) => {

        if (snapshot.exists()) {
            this.gameSession.getUserRef().onDisconnect().update({ presence: { status: OnlineStatus.offline } });
            this.gameSession.getUserRef().update({ presence: { status: OnlineStatus.online } });
            this.online = true;
        } else {
            this.gameSession.getUserRef().update({ presence: { status: OnlineStatus.offline } });
            this.online = false;
        }
    }

    public setupGameStatusListener() {

        if (!this.gameSession) {
            this.logger.error('Subscription service does not a valid game session service');
            return;
        }

        this.logger.log('attempting to build game status subscription');

        let options: SubscribeOptions = {
            node: this.gameSession.getGameRef().child('gameState'),
            eventType: EventTypes.VALUE,
            preserveSnapshot: true
        };

        let fbRx = new FirebaseObservable(
            this.firebaseProjs.default.app, options);

        this.gameStateSubscription = fbRx.getObservable().subscribe(
            this.gameStateListenerCallback
        );

        this.buildUserStatusSubscription();

    }


    protected gameStateListenerCallback = (snapshot: firebase.database.DataSnapshot) => {

        if (snapshot.exists()) {
            let status: GameState = snapshot.val();

            this.logger.log('game state subscription status received: ' + status);

            if (this.sessionErrors.isProcessing) {
                this.logger.log(
                    'still processing error, skipping this game status "'
                    + status + '" event response');
                return;
            }

            if (status === GameState.err) {

                // Show error message
                this.sessionErrors.errorDialog(this.modalErrMsg, 3000);
            }

            if (status === GameState.started) {
                // Navigate back to home page.
                this.router.navigate(['/activegame']);
            }
        }
    }


    protected buildUserStatusSubscription() {

        this.logger.log('attempting to build user status subscription');

        let options: SubscribeOptions = {
            node: this.gameSession.getUserRef().child('game/status'),
            eventType: EventTypes.VALUE,
            preserveSnapshot: true,
            existsOnly: true
        };

        let fbRx = new FirebaseObservable(
            this.firebaseProjs.default.app, options);

        this.userGameStatusSubscription = fbRx.getObservable().subscribe(
            this.userStatusCallback
        );

    }

    protected userStatusCallback = (snapshot: firebase.database.DataSnapshot) => {

        if (snapshot.exists()) {

            let status: GameStatus = snapshot.val();

            this.logger.log('user game subscription status received: ' + status);

            if (this.sessionErrors.isProcessing) {
                this.logger.log(
                    'still processing error, skipping this user status of "' +
                    status + '" event response');
                return;
            }

            if (status === GameStatus.err) {
                this.sessionErrors.errorDialog(this.modalErrMsg, 3000, true);
            }

            if (status === GameStatus.none) {
                this.logger.log('server side usergame reset detected. game likely invalidated!');

                // when games are invalidated server side, it automatically resets the users game
                // status to none, so simply refresh/reset the gamesession service
                this.sessionErrors.errorDialog(this.modalErrMsg, 3000);
            }
        }

    }

}
