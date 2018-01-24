// Vendor Imports 
import { Injectable } from '@angular/core';
import {
    Observable
} from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    FirebaseProjectService,
    FirebaseAuthService,
    AuthProviders,
    AuthServiceOptions,
    ROUTINGTREE
} from '../../../shared';
import {
    AuthTypeEnum,
    AuthEvent,
} from '../event-types';
import {
    LoggingService,
    NgModalService,
} from '../../../shared';
import {
    RedirectAction,
} from '../event-types';
import {
    SessionEventsBroker
} from '../services';


@Injectable()
export class AuthEventsService {

    protected modalRef: NgbModalRef;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected authService: FirebaseAuthService,
        protected modalService: NgModalService,
        protected logger: LoggingService,
        protected eventsBroker: SessionEventsBroker,
    ) {
        this.init();
    }

    protected init() {
        this.eventsBroker.authserviceevent.subscribe(
            event => {
                this.logger.log('auth request event received...');
                this.logger.object(event);
                switch (event.type) {
                    case AuthTypeEnum.login:
                        this.login(event);
                        break;

                    case AuthTypeEnum.logout:
                        this.logout(event);
                        break;

                    case AuthTypeEnum.anonymous:
                        let authOptions: AuthServiceOptions = {
                            provider: AuthProviders.ANONYMOUS
                        };
                        event.args = authOptions;
                        this.login(event);
                        break;

                    case AuthTypeEnum.current:
                    case AuthTypeEnum.currentOrAnonymous:
                        this.currentLogin(event);
                        break;

                }
            });
    }

    protected currentLogin(event: AuthEvent) {

        if (!event.background) {
            this.modalRef =
                this.modalService.waiting('Please wait, checking for previous session...');
        }

        let options: AuthServiceOptions = {
            provider: AuthProviders.ANONYMOUS
        };

        if (event.redirect) {
            this.eventsBroker.newevent_redirectqueue({
                source: 'Auth Events Service',
                action: RedirectAction.NewRedirect,
                url: event.redirect
            });
        }

        this.authService.checkCurrentUser(options)
            .subscribe(
            user => {
                this.closeModal();
                if (user) {
                    this.eventsBroker.newevent_userauthevent(user);
                } else {
                    switch (event.type) {
                        case AuthTypeEnum.current:
                            this.eventsBroker.newevent_redirectqueue({
                                source: 'Auth Events Service',
                                action: RedirectAction.StartRoute
                            });
                            break;
                        case AuthTypeEnum.currentOrAnonymous:
                            event.args = options;
                            this.login(event);
                            break;
                    }
                }
            },
            err => {
                this.errorCaught(err);
            });

    }


    protected login(event: AuthEvent) {

        if (!this.modalRef) {
            this.modalRef = this.modalService.waiting('Please wait, logging in...');
        }

        let authObservable: Observable<firebase.User> = this.authService.login(event.args);
        this.eventsBroker.newevent_redirectqueue({
            source: 'Auth Events Service',
            action: RedirectAction.NewRedirect,
            url: event.redirect ? event.redirect : ROUTINGTREE.profile
        });

        // finally subscribe to login
        authObservable.take(1).subscribe(
            user => {
                if (!user) {
                    this.errorCaught('user object returned is null');
                } else {
                    this.closeModal();
                    this.eventsBroker.newevent_userauthevent(user);
                }
            },
            err => {
                this.errorCaught(err);
            });

    }

    protected logout(event: AuthEvent) {

        this.eventsBroker.newevent_redirectqueue({
            source: 'Auth Events Service',
            action: RedirectAction.NewRedirect,
            url: event.redirect ? event.redirect : ROUTINGTREE.landing
        });

        this.authService.logout(
            this.projectsMgr.projects.default).subscribe(
            result => {
                this.logger.log('logout result: ' + result);
                this.eventsBroker.newevent_userauthevent(null);
            });

    }

    protected errorCaught(err?: any) {
        this.modalRef.close();
        this.eventsBroker.newevent_error({
            message: 'Unable to log you in. Please try again ;)',
            error: err,
            redirect: ROUTINGTREE.login
        });

    }

    protected closeModal() {
        if (this.modalRef) {
            try {
                this.modalRef.close();
                this.modalRef = null;
            } catch (err) { }
        }
    }

}

