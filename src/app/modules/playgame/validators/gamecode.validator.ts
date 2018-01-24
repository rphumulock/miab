// Vendor Imports
import { Injectable } from '@angular/core';
import {
    FormControl
} from '@angular/forms';
import { Observable, Observer, Subject } from 'rxjs';

// App Imports
import {
    getGameId,
} from 'miablib/miab';
import {
    LoggingService,
    FirebaseProjectService
} from '../../../shared';

interface IValidation {
    [error: string]: any;
};

@Injectable()
export class GameCodeValidator {

    protected INVALID_GAMECODE = {
        validGameCode: false
    };

    protected gameIdObserver: Subject<string> | Observer<string>;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService) { }

    validateGameCode = (gameCodeControl: FormControl): Observable<IValidation> => {

        return Observable.create((observer: IValidation) => {

            if (!gameCodeControl.value
                || (gameCodeControl.value as string).length !== 5) {
                observer.next(this.INVALID_GAMECODE);
                observer.complete();
            } else {

                //this.logger.log('attempting to validate player name: ' +
                //' - gameCode: ' + gameCodeControl.value);

                gameCodeControl
                    // Monitor value changes
                    .valueChanges
                    // Avoid sending too much input (typed in keys)
                    .debounceTime(400)
                    // If Value Changes, Cancel Inflight Responses
                    .switchMap(value => {
                        return getGameId((value as string).toUpperCase(),
                            this.projectsMgr.default.app);
                    })
                    .take(1)
                    .subscribe(
                    gameId => {
                        // if a game id was return then this is a valid gamecode
                        if (this.gameIdObserver) {
                            this.gameIdObserver.next(gameId);
                        }
                        observer.next(null);
                        observer.complete();
                    },
                    err => {
                        if (this.gameIdObserver) {
                            this.gameIdObserver.next(null);
                        }
                        observer.next(this.INVALID_GAMECODE);
                        observer.complete();
                    });
            }

        });
    }

    setGameIdRxjs(subject: Subject<string> | Observer<string>) {
        this.gameIdObserver = subject;
    }

}

