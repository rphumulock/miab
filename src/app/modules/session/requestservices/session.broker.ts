// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import {
    Observable,
    Observer
} from 'rxjs';
import {
    NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    NodePaths,
    StreamUser,
    GameStatus,
    IStreamUserRequest,
    ResetUserStatus,
    IResetUserGameRequest,
    getStreamUser
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    FirebaseProjectService,
    LoggingService,
    NgModalService,
    ROUTINGTREE,
} from '../../../shared/';
import {
    SessionBrokerEventTypeEnum,
    SessionManagerEventTypeEnum,
    SubscriptionEventTypeEnum,
    SubscriptionTypeEnum
} from '../event-types';
import {
    SessionEventsBroker
} from '../services';
import {
    UserSessionManager
} from '../managers/usersession.manager';



/**
 * This class is resoonsible for working with the 
 * server side stream session object to;
 * 
 * - get the latest object for the game session object to process
 * - request new session objects
 * - validate and request session object rebuilds
 */
@Injectable()
export class GameSessionBroker {

    protected timeoutRef: any;
    protected modalRef: NgbModalRef;

    constructor(
        protected router: Router,
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected logger: LoggingService,
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
    ) {
        this.init();
    }

    protected init() {
        this.eventsBroker.sessionbroker.subscribe(
            event => {
                this.logger.log('session broker request received');
                this.logger.object(event);
                switch (event.type) {
                    case SessionBrokerEventTypeEnum.Init:
                        this.initGameSession(event.showModal);
                        break;

                    case SessionBrokerEventTypeEnum.Refresh:
                        this.refreshGameSession(event.showModal);
                        break;

                    case SessionBrokerEventTypeEnum.Reset:
                        this.rebuildSession();
                        break;
                }
            });
    }

    protected initGameSession = (showModal: boolean) => {

        let obs = Observable.create(
            (observer: Observer<GameStatus>) => {

                // set the timeout error
                let timeoutErr = 'Unable to successfully initialize\
                the game session status. Please try again :(!';

                // set timeout 
                this.newRequestTimeOut(observer, timeoutErr);

                // reset any previous session values
                this.eventsBroker.newevent_sessionmanager({
                    type: SessionManagerEventTypeEnum.Reset
                });

                // reset any game session subscriptions
                this.eventsBroker.newevent_subscriptions({
                    type: SubscriptionEventTypeEnum.Reset,
                    subscriptions: [SubscriptionTypeEnum.all]
                });

                // show modal if requested
                if (showModal) {
                    this.modalRef = this.modalService.waiting(
                        'Please wait initializing game session...');
                }

                this.returnValidGameSession(observer)

            });

        obs.subscribe();

    }

    protected refreshGameSession = (showModal: boolean) => {

        let obs = Observable.create(
            (observer: Observer<GameStatus>) => {

                // set the timeout error
                let timeoutErr = 'Unable to successfully refresh\
                 the game session status. Please try again :(!';

                // set timeout 
                this.newRequestTimeOut(observer, timeoutErr);

                // reset any previous session values
                this.eventsBroker.newevent_sessionmanager({
                    type: SessionManagerEventTypeEnum.Reset
                });

                // reset any game specific subscriptions
                this.eventsBroker.newevent_subscriptions({
                    type: SubscriptionEventTypeEnum.Reset,
                    subscriptions: [SubscriptionTypeEnum.gamestatus]
                });

                // show modal if requested
                if (showModal) {
                    this.modalRef = this.modalService.waiting(
                        'Please wait refreshing game session...');
                }

                this.returnValidGameSession(observer);

            });

        obs.subscribe();

    }

    protected rebuildSession = () => {

        // show modal
        this.modalRef = this.modalService.waiting(
            'Please wait resetting game session...');

        // reset any previous session values
        this.eventsBroker.newevent_sessionmanager({
            type: SessionManagerEventTypeEnum.Reset
        });

        this.requestSessionRebuild()
            .subscribe(
            (user: StreamUser) => {
                // clear any existing timeouts
                this.clearTimeout();

                // reset any game session subscriptions
                this.eventsBroker.newevent_subscriptions({
                    type: SubscriptionEventTypeEnum.Reset,
                    subscriptions: [SubscriptionTypeEnum.all]
                });

                // broadcast the new session user to any subscribers 
                this.eventsBroker.newevent_sessionmanager({
                    type: SessionManagerEventTypeEnum.ProcessSession,
                    sessionvalue: user
                });

                // close any existing modals
                this.closeModal();

            },
            err => {
                this.logger.error(err);
                this.notifyError('Unable to reset and build a valid session :(');
            });
    }

    protected validateUser(user: StreamUser): Observable<StreamUser> {

        if (StreamUser.validateUser(user)) {
            return Observable.of(user);
        } else {
            return this.requestSessionRebuild();
        }

    }

    protected returnValidGameSession(observer: Observer<StreamUser>) {

        if (!this.userSession.userId) {

            let errMsg = 'User must be logged in before\
            requesting a game session';

            this.eventsBroker.newevent_error({
                message: errMsg,
                redirect: ROUTINGTREE.login
            });

            this.logger.error(errMsg);
            observer.error(errMsg);

            observer.complete();
            return;
        }

        getStreamUser(this.userSession.userId,
            this.projectsMgr.default.app)
            .catch(
            err => {
                this.logger.log('no streamuser on init. requesting new');
                return this.requestNewStreamUser();
            })
            .flatMap(
            (user) => {
                return this.validateUser(user);
            })
            .subscribe(
            validatedUser => {
                // clear any existing timeouts
                this.clearTimeout();

                // log the returned user
                this.logger.log('stream user returned: '
                    + JSON.stringify(validatedUser));

                // request user presence subscription
                // reset any game session subscriptions
                this.eventsBroker.newevent_subscriptions({
                    type: SubscriptionEventTypeEnum.Init,
                    subscriptions: [SubscriptionTypeEnum.userpresence]
                });

                // broadcast the new session user to any subscribers 
                // broadcast the new session user to any subscribers 
                this.eventsBroker.newevent_sessionmanager({
                    type: SessionManagerEventTypeEnum.ProcessSession,
                    sessionvalue: validatedUser
                });
                // close any existing modals
                this.closeModal();

                // broadcast to any subscribers
                observer.next(validatedUser);
                observer.complete();
            },
            err => {
                this.logger.error(err);
                this.eventsBroker.newevent_error({
                    message: 'Unable to establish a valid user game session',
                    error: err,
                    redirect: ROUTINGTREE.error
                });
                observer.error(err);
                observer.complete();

            });
    }

    protected requestNewStreamUser(): Observable<StreamUser> {

        this.logger.log('requesting new stream user...');

        let options: SubscribeOptions = {
            eventType: EventTypes.VALUE,
            node: this.getUserRef(),
            existsOnly: true
        };

        let fbRx = new FirebaseObservable(this.projectsMgr.default.app, options);

        return Observable.create(
            (observer: Observer<StreamUser>) => {

                fbRx.getObservable()
                    .take(1)
                    .subscribe(
                    (user: StreamUser) => {
                        this.clearTimeout();
                        observer.next(user);
                        observer.complete();
                    },
                    error => {
                        this.clearTimeout();
                        observer.error(error);
                        observer.complete();
                    });

                let request: IStreamUserRequest = {
                    userId: this.userSession.userId,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };

                let streamUserRequestPath = concatPath([
                    NodePaths.STREAM_USER_REQUEST,
                    this.userSession.userId
                ]);

                this.projectsMgr.default.db.ref(streamUserRequestPath).set(request);

                // set the timeout error
                let timeoutErr = 'Unable to successfully request a new\
                game session. Please try again :(!';

                // set timeout 
                this.newRequestTimeOut(observer, timeoutErr);
            }
        );

    }

    protected requestSessionRebuild(): Observable<StreamUser> {

        this.logger.log('submitting session reset/rebuild request');

        let resetRequest: IResetUserGameRequest = {
            userId: this.userSession.userId,
            status: ResetUserStatus.submitted
        };

        // submit a user reset request 
        let resetRequestRef = this.projectsMgr.default.db
            .ref(NodePaths.RESET_USERGAME_REQUESTS)
            .push();

        let options: SubscribeOptions = {
            node: resetRequestRef.child('status'),
            eventType: EventTypes.VALUE,
            existsOnly: true
        };

        let rxFb = new FirebaseObservable(
            this.projectsMgr.default.app, options);

        return Observable.create(
            (observer: Observer<StreamUser>) => {

                rxFb.getObservable()
                    .filter(
                    (requestStatus: ResetUserStatus) => {
                        this.logger.log('session error service. user reset request status received: ' + requestStatus);

                        if (requestStatus === ResetUserStatus.completed) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                    .take(1)
                    .flatMap(
                    (status: ResetUserStatus) => {
                        this.clearTimeout();
                        resetRequestRef.update({ 'status': ResetUserStatus.acknowledged });

                        return getStreamUser(this.userSession.userId,
                            this.projectsMgr.default.app);
                    })
                    .subscribe(
                    (user: StreamUser) => {
                        if (!StreamUser.validateUser(user)) {
                            observer.error('Invalid game object after reset');
                            observer.complete();
                        } else {
                            observer.next(user);
                            observer.complete();
                        }
                    },
                    err => {
                        this.clearTimeout();
                        observer.error(err);
                        observer.complete();
                    });

                // set the timeout error
                let timeoutErr = 'Unable to successfully request and complete\
                a session reset/rebuild. Please try again :(!';

                // set timeout 
                this.newRequestTimeOut(observer, timeoutErr);

                // Actually now make the reset request
                resetRequestRef.set(resetRequest);

            });

    }

    protected getUserRef = (): firebase.database.Reference => {
        let userRef = this.projectsMgr.default.db.ref(
            concatPath([
                NodePaths.STREAM_USERS,
                this.userSession.userId
            ]));

        return userRef;
    }

    protected newRequestTimeOut(observer: Observer<StreamUser>, err) {
        this.clearTimeout();
        this.timeoutRef = setTimeout(this.requestTimedOut, 10000, observer, err);
    }

    protected requestTimedOut = (observer: Observer<StreamUser>,
        errMsg: string) => {

        this.notifyError(errMsg, true);
        observer.error(errMsg);
        observer.complete();

    }

    protected closeModal() {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    protected notifyError(msg: string, goToLanding?: boolean) {

        this.closeModal();

        if (msg) {
            this.eventsBroker.newevent_error({
                message: msg,
                redirect: goToLanding ? ROUTINGTREE.landing : ROUTINGTREE.error
            });
        } else {
            this.eventsBroker.newevent_error({
                message: 'Unable to establish a\
             valid user game session. Timed out',
                redirect: goToLanding ? ROUTINGTREE.landing : ROUTINGTREE.error
            });
        }

    }

    protected clearTimeout() {
        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef);
        }
    }

}

