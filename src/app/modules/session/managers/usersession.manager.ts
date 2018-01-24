// Vendor Imports 
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


// App Imports
import {
    concatPath
} from 'miablib/global';
import {
    NodePaths,
} from 'miablib/miab';
import {
    FirebaseProjectService,
    LoggingService,
    RemoteLoggingService,
    AuthProviders,
    ParseProvider,
} from '../../../shared';
import {
    RedirectAction,
} from '../event-types';
import {
    SessionEventsBroker
} from '../';

@Injectable()
export class UserSessionManager {

    protected _provider: AuthProviders;
    get authProvider(): AuthProviders { return this._provider; }

    protected _userId: string;
    get userId(): string { return this._userId; }

    protected _isAnonymous: boolean;
    get isAnonymous(): boolean { return this._isAnonymous; }

    protected _displayName: string;
    get displayName(): string { return this._displayName; }

    protected _emailAddress: string;
    get email(): string { return this._emailAddress; }

    protected _photoUrl: string;
    get photoUrl(): string { return this._photoUrl; }

    protected _isInitialized: boolean;
    get isInitialized(): boolean { return this._isInitialized; }

    protected _timestamp: Date;
    get timestamp(): Date { return this._timestamp; }

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService,
        protected eventsBroker: SessionEventsBroker,
        protected remoteLogger: RemoteLoggingService) {
        this._isInitialized = false;
        this._isAnonymous = false;
        this.eventsBroker.userauthevent
            .subscribe(this.setupUserSession);
    }

    protected setupUserSession = (user: firebase.User) => {

        this.resetUserSession();

        if (!user) {
            this.processLogout();
            return; // this was a logout event;
        }

        this._userId = user.uid;
        this._isAnonymous = user.isAnonymous;
        this.remoteLogger.provideUserId(user.uid);

        if (!this._isAnonymous) {

            this._provider = ParseProvider(user.providerId);

            switch (this._provider) {

                case AuthProviders.EMAIL:
                    this._displayName = user.displayName;
                    this._emailAddress = user.email;
                    this._photoUrl = user.photoURL;
                    break;

                /*
                case FACEBOOK:
                    this.displayName = user.providerData['property'];
                    this.emailAddress = user.providerData['property'];
                    this.photoUrl = user.providerData['property'];
                    break;
                */
            }

        }

        this._isInitialized = true;
        this._timestamp = new Date(Date.now());
        this.eventsBroker.newevent_redirectqueue({
            source: 'User Session Service',
            action: RedirectAction.StartRoute
        });

    }

    protected processLogout() {
        this.resetUserSession();

        this.eventsBroker.newevent_redirectqueue({
            source: 'User Session Service',
            action: RedirectAction.StartRoute
        });
        this.remoteLogger.provideUserId(null);
        return; // this was a logout event;
    }

    getUserRef = (): firebase.database.Reference => {
        let userRef = this.projectsMgr.default.db.ref(
            concatPath([
                NodePaths.STREAM_USERS,
                this._userId
            ]));

        return userRef;
    }

    protected resetUserSession() {
        this._timestamp = null;
        this._userId = null;
        this._displayName = null;
        this._emailAddress = null;
        this._isAnonymous = false;
        this._photoUrl = null;
        this._provider = null;
        this._isInitialized = false;
        this.remoteLogger.provideUserId('');
    }

}

