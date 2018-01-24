// Vendor Imports
import { Injectable } from '@angular/core';
import {
    FormControl,
    FormGroup
} from '@angular/forms';
import { Observable } from 'rxjs';

// App Imports
import * as firebase from 'firebase';
import { FirebaseObservable, SubscribeOptions, EventTypes } from 'miablib/firebaseutil';
import {
    NodePaths
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { LoggingService, FirebaseProjectService } from '../../../shared';

interface IValidation {
    [error: string]: any;
};

@Injectable()
export class DisplayNameValidatorService {

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService) {
    }

    validateDisplayName = (displayNameControl: FormControl): Observable<IValidation> => {

        return Observable.create((observer: IValidation) => {

            if (!displayNameControl.value) {
                observer.next(
                    { invalid: true }
                );
                observer.complete();
            } else {
                let gameCodeNodeSubscription =
                    displayNameControl
                        // Monitor value changes
                        .valueChanges
                        // Avoid sending too much input (typed in keys)
                        .debounceTime(400)
                        // If Value Changes, Cancel Inflight Responses
                        .switchMap(value => {
                            return this.userNamesObservable(value);
                        })
                        .subscribe((snap: firebase.database.DataSnapshot) => {
                            // If the game code exists return null (which is true in validators)
                            if (snap.exists()) {
                                // Otherwise return an error object
                                observer.next(
                                    { invalid: true }
                                );

                                this.logger.log('failed unique username check...')

                            } else {

                                this.logger.log('passed unique username check...')
                                observer.next(null);
                            }
                            observer.complete();
                        });

                // Return an unsubscribe callback when the observable is disconnected. 
                return function unsubscribe() {
                    gameCodeNodeSubscription.unsubscribe();
                };
            }

        });

    }

    protected userNamesObservable = (userName: string) => {

        let options: SubscribeOptions = {
            node: concatPath([NodePaths.USERNAMES, userName]),
            eventType: EventTypes.VALUE,
            preserveSnapshot: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        this.logger.log('checking isvalid new username: ' + userName);

        return rxFb.getObservable();

    }

}
