// Vendor Imports
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable, Observer } from 'rxjs';

// App Imports
import {
    FirebaseProject,
} from 'miablib/firebaseutil';
import { 
    FirebaseProjectService 
} from './firebase.project.service';
import {
    AuthServiceOptions,
    AuthProviders
} from './firebase.auth.types';


@Injectable()
export class FirebaseAuthService {

    _loggedIn: boolean;
    get loggedIn(): boolean { return this._loggedIn; }

    _redirectUrl: string;
    /**
     * Will return a previously set redirect url.
     * 
     * When you call this function it will reset the 
     * previously stored redirect url to null
     */
    get redirectUrl(): string {
        if (this._redirectUrl) {
            let url = this._redirectUrl;
            this._redirectUrl = null;
            return url;
        } else {
            return null;
        }
    }
    /**
     * Will set this objects redirect url value;
     */
    set redirectUrl(url: string) { this._redirectUrl = url; }

    constructor(protected firebaseMgrService: FirebaseProjectService) {
        this._loggedIn = false;
    }

    protected getAuthProject(options: AuthServiceOptions): FirebaseProject {
        /**
                 * Get the target firebase project and ensure it is initialized
                 */
        let project: FirebaseProject;

        if (options.firebaseProject) {
            project = options.firebaseProject;
        } else {
            project = this.firebaseMgrService.default;
        }

        if (!project.isInitialized) {
            project.initProject();
        }

        return project;
    }

    checkCurrentUser(options: AuthServiceOptions): Observable<firebase.User> {
        /**
        * Get the target firebase project and ensure it is initialized
        */
        let project: FirebaseProject = this.getAuthProject(options);

        let deferredObservable: Observable<firebase.User> =
            /**
             * Using the Observable.defer() operator allows us to ensure the monitoring
             * observable will not be instanitated until a subscription is requested
             */
            Observable.defer((): Observable<firebase.User> => {

                /**
                 * The returned unsubscribe function returned 
                 * from the onAuthStateChanged() method
                 */
                let firebaseSubscription;

                /**
                 * Inner observable used to connect to firebase and return
                 * a firebase User object
                 */
                let innerObservable: Observable<firebase.User> =
                    Observable.create(
                        (
                            (observer: Observer<firebase.User>) => {

                                firebaseSubscription =
                                    project.app.auth().onAuthStateChanged(
                                        /**
                                         * First parameteer of the onAuthStateChanged
                                         * function expects a function which itself 
                                         * accepts a firebase.User object
                                         */
                                        (user: firebase.User) => {

                                            // update my loggedin tracking memebers
                                            if (user) {
                                                this._loggedIn = true;
                                            } else {
                                                this._loggedIn = false;
                                            }

                                            /**
                                             * Provide this user object to the subscribers
                                             */
                                            observer.next(user);
                                            observer.complete();
                                        },
                                        /**
                                         * Second parameter of the onAuthStateChanged function
                                         * expects a error hangler. 
                                         * 
                                         * We simply inform subscribers of said error
                                         */
                                        err => {
                                            observer.error(err);
                                        }
                                    );

                                /**
                                 * Return a disposal callback function
                                 * when subscribers unsubscribe from 
                                 * this observable
                                 */
                                return function () {
                                    firebaseSubscription();
                                };
                            })
                    ).finally(
                        /**
                         * Observable.finally() operator allows us
                         * to catch errors from the source data 
                         * (which for us is the onAuthStateChanged(...))
                         * and call a finally statement
                         */
                        () => {
                            firebaseSubscription();
                        });

                /**
                 * Before we return the new innerObservable (which has now 
                 * already registered to the onAuthStateChanged method)
                 * 
                 * We finally make a request for the current authenticated user
                 */
                project.app.auth().currentUser;

                return innerObservable;

            });

        return deferredObservable;
    }

    /**
     * Will return an observable you can use tot monitor authentication events
     * 
     * **** WILL NOT AUTHENTICATE UNTIL YOU SUBSCRIBE *****
     * @param options - Authentication Service Options
     */
    login(options: AuthServiceOptions): Observable<firebase.User> {

        /**
         * Get the target firebase project and ensure it is initialized
         */
        let project: FirebaseProject = this.getAuthProject(options);

        let deferredObservable: Observable<firebase.User> =
            /**
             * Using the Observable.defer() operator allows us to ensure the monitoring
             * observable will not be instanitated until a subscription is requested
             */
            Observable.defer((): Observable<firebase.User> => {

                /**
                 * The returned unsubscribe function returned 
                 * from the onAuthStateChanged() method
                 */
                let firebaseSubscription;

                let isAnonymousLogin = options.provider === AuthProviders.ANONYMOUS;

                /**
                 * Inner observable used to connect to firebase and return
                 * a firebase User object
                 */
                let innerObservable: Observable<firebase.User> =
                    Observable.create(
                        (
                            (observer: Observer<firebase.User>) => {

                                let count = 0;

                                firebaseSubscription =
                                    project.app.auth().onAuthStateChanged(

                                        /**
                                         * First parameteer of the onAuthStateChanged
                                         * function expects a function which itself 
                                         * accepts a firebase.User object
                                         */
                                        (user: firebase.User) => {

                                            //console.log('count: ' + count);
                                            //console.log('user returned: ' + (user ? 'yes' : 'no'));

                                            /**
                                             * This checks if on subscription we are
                                             * returned the currently logged in user 
                                             * and if that user is anonymous, 
                                             * then do in fact send it to the observer
                                             */
                                            if (count++ === 0) {
                                                if (user && isAnonymousLogin) {
                                                    this._loggedIn = true;
                                                    /**
                                                    * Provide this user object to the subscribers
                                                    */
                                                    observer.next(user);
                                                    observer.complete();
                                                }
                                            } else {
                                                // update my loggedin tracking memebers
                                                if (user) {
                                                    this._loggedIn = true;
                                                } else {
                                                    this._loggedIn = false;
                                                }
                                                /**
                                                 * Provide this user object to the subscribers
                                                 */
                                                observer.next(user);
                                                observer.complete();
                                            }

                                        },
                                        /**
                                         * Second parameter of the onAuthStateChanged function
                                         * expects a error handler. 
                                         * 
                                         * We simply inform subscribers of said error
                                         */
                                        err => {
                                            observer.error(err);
                                        }
                                    );

                                /**
                                 * Return a disposal callback function
                                 * when subscribers unsubscribe from 
                                 * this observable
                                 */
                                return function () {
                                    firebaseSubscription();
                                };
                            })
                    ).finally(
                        /**
                         * Observable.finally() operator allows us
                         * to catch errors from the source data 
                         * (which for us is the onAuthStateChanged(...))
                         * and call a finally statement
                         */
                        () => {
                            firebaseSubscription();
                        });

                /**
                 * Before we return the new innerObservable (which has now 
                 * already registered to the onAuthStateChanged method)
                 * 
                 * We finally authentication the user as requested.
                 * All of this code will not be executed (the subscription or the login)
                 * until a user subscribes to the deferred observable.
                 * 
                 * Eventually we'll use a switch statement and helper functions.
                 */
                if (options.provider === AuthProviders.ANONYMOUS) {
                    project.app.auth().signInAnonymously();
                } else {
                    if (options.emailAuth.newAccount) {
                        project.app.auth().createUserWithEmailAndPassword(
                            options.emailAuth.email,
                            options.emailAuth.password);

                    } else {

                        project.app.auth().signInWithEmailAndPassword(
                            options.emailAuth.email,
                            options.emailAuth.password);
                    }
                }

                return innerObservable;

            });

        return deferredObservable;

    }

    logout(project: FirebaseProject): Observable<boolean> {
        return Observable.defer((): Observable<boolean> => {
            let newObservable = Observable.create(
                (observer: Observer<boolean>) => {
                    project.app.auth().signOut()
                        .then(
                        () => {
                            // update my loggedin tracking memebers
                            this._loggedIn = false;
                            observer.next(true);
                            observer.complete();
                        })
                        .catch(
                        err => {
                            observer.error(err);
                        });
                });
            return newObservable;
        })
    }

    sendPwResetEmail(project: FirebaseProject, emailAddr: string): Observable<boolean> {
        return Observable.defer((): Observable<boolean> => {
            let newObservable = Observable.create(
                (observer: Observer<boolean>) => {
                    project.app.auth()
                        .sendPasswordResetEmail(emailAddr)
                        .then(
                        () => {
                            observer.next(true);
                            observer.complete();
                        })
                        .catch(
                        err => {
                            observer.error(err);
                        });
                });
            return newObservable;
        })
    }

    finalizePasswordReset(project: FirebaseProject, resetCode: string, newPassword: string) {
        return Observable.defer((): Observable<boolean> => {
            let newObservable = Observable.create(
                (observer: Observer<boolean>) => {
                    project.app.auth().confirmPasswordReset(resetCode, newPassword)
                        .then(
                        () => {
                            observer.next(true);
                            observer.complete();
                        })
                        .catch(
                        err => {
                            observer.error(err);
                        });
                });
            return newObservable;
        })
    }

    verifyPwResetCode(project: FirebaseProject, resetCode: string, newPassword: string) {
        return Observable.defer((): Observable<boolean> => {
            let newObservable = Observable.create(
                (observer: Observer<boolean>) => {
                    project.app.auth().verifyPasswordResetCode(resetCode)
                        .then(
                        () => {
                            observer.next(true);
                            observer.complete();
                        })
                        .catch(
                        err => {
                            observer.error(err);
                        });
                });
            return newObservable;
        })
    }

}
