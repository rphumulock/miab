// Vendor Imports
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import * as firebase from 'firebase';
import { Mutex } from 'async-mutex';

// App Imports
import {
    UserGame,
    GameStatus,
    NodePaths,
    OnlineStatus,
    StreamUser,
    ConnectionType,
    IReturningUserRequest
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { devAppConfig, productionAppConfig } from './auth.config';
import { FirebaseObservable, SubscribeOptions, EventTypes } from 'miablib/firebaseutil';

const mutex: Mutex = new Mutex();

/**
 * Purpose: This service provides a singleton instance of 
 * data to the application throughout its lifecycle allowing 
 * easy and immediate access to resources needed throughout the application.
 * 
 * 
 * Major Component/Elements: 
 * - Handling user authentication 
 * - Handling user online/offline presence monitoring
 * - Keeping a singleton instance of app wide resources
 * 
 * To-do:
 * - Logic to complete handling of user state rebuilding 
 * (e.g. if a user leaves the webpage and returns, putting them back in their old state - lobby, frame)
 * 
 * - Handling requesting a new streamuser object in firebase after a completed game,
 * or at the minimum resetting the current game session data, and requesting a new 
 * game object in firebase, or deleting whatever
 * 
 * - Server side: inverse logic checking for returning user requests, and make sure permanent version of user is stored
 */
@Injectable()
export class GameSessionService {
    // References
    userRef: firebase.database.Reference;
    gameRef: firebase.database.Reference;
    presenceRef: firebase.database.Reference;
    presenceSubscription: Subscription;

    // User identity variables
    user: firebase.User;
    userId: string;
    online: boolean;

    // Game variables
    gameCode: string;
    gameId: string;
    isHosting: boolean;
    playerName: string;

    // Firebase variables
    db: firebase.database.Database;
    storage: firebase.storage.Storage;
    firebaseApp: firebase.app.App;

    // Callback management variables
    protected streamUserFound: boolean;
    protected returningUserTimeoutEvent: NodeJS.Timer;
    protected timeoutCleared: boolean;

    /**
     * onAuthStateChanged returns a non-null function that 
     * can be invoked to remove the subscription to that event
     * https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged
     */
    protected unsubscribeFunction;

    constructor(protected router: Router) { this.initializeApp(); }

    initializeApp() {

        this.firebaseApp = firebase.initializeApp(productionAppConfig);
        this.db = this.firebaseApp.database();
        this.storage = this.firebaseApp.storage();

        this.unsubscribeFunction = firebase.auth().onAuthStateChanged(this.onAuthCallback);

        // Attempt to get the currently logged in user
        let user: firebase.User = firebase.auth().currentUser;

        if (user) {
            this.onAuthCallback(user);

            // Unsubscribe the on 
            this.unsubscribeFunction();
        } else {
            firebase.auth().signInAnonymously();
        }
    }

    /**
     * Once a valid authencation token is provided from the server
     * with a suers unique ID, the user will then immeditalte
     * check to see if its "StreamUser" objecct was created
     * by the server.
     * @param authEvent 
     */
    protected onAuthCallback(user: firebase.User) {

        this.unsubscribeFunction();

        // get and save the users id
        this.userId = user.uid;

        // get and save the users reference in streamusers
        this.userRef = this.db.ref(concatPath([NodePaths.STREAM_USERS, this.userId]));

        let rxOptions: SubscribeOptions = new SubscribeOptions(
            this.userRef, EventTypes.VALUE);
        rxOptions.existsOnly = true;

        let fbRx = new FirebaseObservable(this.firebaseApp, rxOptions);

        fbRx.getObservable().take(1).subscribe(this.initGameSession);

        let returningUserTimeoutEvent = setTimeout(this.notifyReturningUser, 2400);
    }

    /**
     * Instance function which will submit a 'returning' user request to the
     * server in the event this user had a previous session and so
     * the 'onCreate' server cloud function is never fired.
     * 
     * The server will listen to this new entry and create a new 
     * StreamUser object for this session to use.
     */
    protected notifyReturningUser = () => {
        this.timeoutCleared = true;

        if (!this.atomicUserFoundCheck(false)) {

            let returningUserRequest: IReturningUserRequest = {
                user: this.userId
            };
            this.db.ref(concatPath([NodePaths.RETURNING_USER_REQUEST])).push(returningUserRequest);
        }
    }

    /**
     * Used to get atomic reads and writes of the class
     * streamUserFound variable
     */
    protected atomicUserFoundCheck(update: boolean) {
        mutex.acquire().then(release => {
            try {
                if (update) {
                    this.streamUserFound = true;
                }

                return this.streamUserFound;
            } finally {
                release();
            }
        });
    }

    /**
     * Will check the user connection type and update its connection
     * type on the database. Basically if the connection type is 
     * created (new user), then it will update it to "inital"
     * 
     * However if the connection type on the database is "initial"
     * then this is a reconnection and it will updat it appropriately.
     * 
     * This function will also invoke the "rebuildGameSessionVars" 
     * which can be used to re-establish a user into a game if they lose
     * connectivity momentairly
     * 
     * Finally this will invoke the 
     * "buildUserPresenceSubscription" function
     * @param streamUser 
     */
    protected initGameSession = (streamUser: StreamUser) => {

        // update the streamUserFound variable
        this.atomicUserFoundCheck(true);

        // Cancel this timeout event if it has not already happenned
        if (!this.timeoutCleared && this.returningUserTimeoutEvent) {
            clearTimeout(this.returningUserTimeoutEvent);
            this.timeoutCleared = true;
        }

        switch (streamUser.presence.connection) {

            case ConnectionType.created:
                this.userRef.update({ presence: { connection: ConnectionType.initial } });
                break;

            case ConnectionType.initial:
                this.userRef.update({ presence: { connection: ConnectionType.reconnect } });
                // this.rebuildGameSessionVars(); // <-- use this if re-establishing user game state
                break;

            case ConnectionType.reconnect:
                // this.rebuildGameSessionVars(); // // <-- use this if re-establishing user game state
                break;

            default:
                // Error Handling...
                break;

        }

        this.buildUserPresenceSubscription();
    }

    /**
     * This function will subscribe to the local copy of a node
     * that the user has access to that tells it its online/offline 
     * mode based on network events locally on the client.
     */
    protected buildUserPresenceSubscription() {

        this.presenceRef = this.db.ref('.info/connected');

        let rxOptions: SubscribeOptions = new SubscribeOptions(
            this.presenceRef, EventTypes.VALUE);
        rxOptions.preserveSnapshot = true;

        let fbRx = new FirebaseObservable(this.firebaseApp, rxOptions);

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
            this.userRef.onDisconnect().update({ presence: { status: OnlineStatus.offline } });
            this.userRef.update({ presence: { status: OnlineStatus.online } });
            this.online = true;
        } else {
            this.userRef.update({ presence: { status: OnlineStatus.offline } });
            this.online = false;
        }
    }

    protected rebuildGameSessionVars() {
        let userGameRef = this.userRef.child('game');
        userGameRef.once('value', this.gameRefCallback);
    }

    protected gameRefCallback = (snapshot: firebase.database.DataSnapshot) => {

        if (snapshot.exists()) {
            this.gameRef = snapshot.ref;
            let game: UserGame = snapshot.val();
            this.gameCode = game.gameCode;
            this.gameId = game.gameId;
            this.isHosting = game.myStatus === GameStatus.hosting;

            // if game.gamestaus == inqueue -> goto lobby
            // if game.gamestatus == hosting --> update the isHosting variable then goto lobby
            if (game.myStatus === GameStatus.inqueue || game.myStatus === GameStatus.hosting) {
                this.router.navigateByUrl('#/lobby');
                return;
            }

            // if game.gamestatus == started, check game frame 
            if (game.myStatus === GameStatus.started) {
                // get game by game id
                // get the current frame...
                // if frame % 2 == 0, goto text frame, else goto drawingframe
            }

            // if game.err then what?
        }

    }

}
