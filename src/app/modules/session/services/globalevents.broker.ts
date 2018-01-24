// Vendor Imports 
import { Injectable } from '@angular/core';
import {
    Observable,
    Subject
} from 'rxjs';

// App Imports
import {
    LoggingService,
} from '../../../shared';
import {
    AuthEvent,
    SessionErrorEvent,
    SubscriptionsManagementEvent,
    SessionManagerEvent,
    SessionBrokerEvent,
    RedirectOptions,
} from '../event-types';



/**
 * This class is responsible for maintaing game session state
 * data throughout the application. 
 * 
 * This class also provides functionality to re-establish 
 */
@Injectable()
export class SessionEventsBroker {

    protected _errors: Subject<SessionErrorEvent>;
    get errors(): Observable<SessionErrorEvent> { return this._errors.asObservable(); }

    protected _sessionmanager: Subject<SessionManagerEvent>;
    get sessionmanager(): Observable<SessionManagerEvent> { return this._sessionmanager.asObservable(); }

    protected _sessionbroker: Subject<SessionBrokerEvent>;
    get sessionbroker(): Observable<SessionBrokerEvent> { return this._sessionbroker.asObservable(); }

    protected _subscriptions: Subject<SubscriptionsManagementEvent>;
    get subscriptions(): Observable<SubscriptionsManagementEvent> { return this._subscriptions.asObservable(); }

    protected _sessionupdated: Subject<boolean>;
    get sessionupdated(): Observable<boolean> { return this._sessionupdated.asObservable(); }

    protected _userauthevent: Subject<firebase.User>;
    get userauthevent(): Observable<firebase.User> { return this._userauthevent.asObservable(); }

    protected _authserviceevent: Subject<AuthEvent>;
    get authserviceevent(): Observable<AuthEvent> { return this._authserviceevent.asObservable(); }

    protected _redirectqueue: Subject<RedirectOptions>;
    get redirectqueue(): Observable<RedirectOptions> { return this._redirectqueue.asObservable(); }

    constructor(
        protected logger: LoggingService
    ) {
        this.init();
    }

    protected init() {

        this._errors = new Subject<SessionErrorEvent>();

        this._sessionmanager = new Subject<SessionManagerEvent>();

        this._sessionbroker = new Subject<SessionBrokerEvent>();

        this._subscriptions = new Subject<SubscriptionsManagementEvent>();

        this._sessionupdated = new Subject<boolean>();

        this._userauthevent = new Subject<firebase.User|null>();

        this._authserviceevent = new Subject<AuthEvent>();

        this._redirectqueue = new Subject<RedirectOptions>();

        this._redirectqueue = new Subject<RedirectOptions>();

    }

    public newevent_error(opts: SessionErrorEvent) {
        this._errors.next(opts);
    }

    public newevent_sessionmanager(opts: SessionManagerEvent) {
        this._sessionmanager.next(opts);
    }

    public newevent_sessionbroker(opts: SessionBrokerEvent) {
        this._sessionbroker.next(opts);
    }

    public newevent_subscriptions(opts: SubscriptionsManagementEvent) {
        this._subscriptions.next(opts);
    }

    public newevent_sessionupdated() {
        this._sessionupdated.next(true);
    }

    public newevent_userauthevent(user: firebase.User) {
        this._userauthevent.next(user);
    }

    public newevent_authserviceevent(options: AuthEvent) {
        this._authserviceevent.next(options);
    }
    public newevent_redirectqueue(opts: RedirectOptions) {
        this._redirectqueue.next(opts);
    }

}

