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
import { NodePaths } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { LoggingService, FirebaseProjectService } from '../../../shared';
import { LinkGuestAccountService } from './linkguestaccount.service';

interface IValidation {
    [error: string]: any;
};

@Injectable()
export class PermlinkValidationService {

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected linkAcctsService: LinkGuestAccountService,
        protected logger: LoggingService) {
    }

    validatePermlink = (permlinkControl: FormControl): Observable<IValidation> => {

        return Observable.create((observer: IValidation) => {

            if (!permlinkControl.value) {
                observer.next(
                    { validPermlink: false }
                );
                observer.complete();
            } else {
                let gameCodeNodeSubscription =
                    permlinkControl
                        // Monitor value changes
                        .valueChanges
                        // Avoid sending too much input (typed in keys)
                        .debounceTime(400)
                        // If Value Changes, Cancel Inflight Responses
                        .switchMap(value => {
                            return this.permlinkObservable(value);
                        })
                        .subscribe((snap: firebase.database.DataSnapshot) => {
                            // If the game code exists return null (which is true in validators)
                            if (!snap.exists()) {

                                this.linkAcctsService.resetPermlinkDetails();

                                // Otherwise return an error object
                                observer.next(
                                    { validPermlink: false }
                                );

                                this.logger.log('failed permlink code check...')

                            } else {
                                this.linkAcctsService.provideValidatedPermlinkDetails(
                                    snap.key, snap.val());
                                this.logger.log('passed permlink codecheck...')
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

    protected permlinkObservable = (permlinkCode: string) => {

        let options: SubscribeOptions = {
            node: concatPath([NodePaths.USERPERMLINKCODES, permlinkCode]),
            eventType: EventTypes.VALUE,
            preserveSnapshot: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        this.logger.log('checking isvalid permlink code: ' + permlinkCode);

        return rxFb.getObservable();

    }
}

