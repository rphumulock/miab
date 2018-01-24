// Vendor Imports
import { Injectable } from '@angular/core';
import {
    FormControl
} from '@angular/forms';
import { Observable, Observer } from 'rxjs';

// App Imports
import {
    Game,
    IGamePlayerEntry,
    getGame
} from 'miablib/miab';
import { LoggingService, FirebaseProjectService } from '../../../shared';

interface IValidation {
    [error: string]: any;
};

@Injectable()
export class PlayerNameValidator {

    protected INVALID_PLAYERNAME = {
        validPlayerName: false
    };

    protected lastValidGameId: string;
    protected validGameIdObs: Observable<string>;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService) { }

    validatePlayerName = (playerNameControl: FormControl): Observable<IValidation> => {

        return Observable.create((observer: IValidation) => {

            if (!playerNameControl.value || !this.lastValidGameId) {
                observer.next(this.INVALID_PLAYERNAME);
                observer.complete();
            } else {

                /*
                this.logger.log('attempting to validate player name: ' +
                    ' - gameId: ' + this.lastValidGameId +
                    ' - name: ' + playerNameControl.value);
                */

                playerNameControl
                    // Monitor value changes
                    .valueChanges
                    // Avoid sending too much input (typed in keys)
                    .debounceTime(400)
                    // If Value Changes, Cancel Inflight Responses
                    .switchMap(value => {
                        return this.isValidPlayerName(value);
                    })
                    .take(1)
                    .subscribe(
                    result => {
                        observer.next(result);
                        observer.complete();
                    },
                    err => {
                        observer.next(this.INVALID_PLAYERNAME);
                        observer.complete();
                    });
            }

        });
    }

    setGameIdRxjs(obs: Observable<string>) {
        this.validGameIdObs = obs;
        this.validGameIdObs.subscribe(val => {
            this.lastValidGameId = val;
        });
    }

    protected isValidPlayerName = (
        playerName: string): Observable<IValidation> => {

        return Observable.create((observer: Observer<IValidation>) => {

            getGame(this.lastValidGameId, this.projectsMgr.default.app)
                .subscribe(
                (game: Game) => {
                    if (!Game.validateGame(game)) {
                        observer.next(this.INVALID_PLAYERNAME);
                        observer.complete();
                    } else {
                        observer.next(
                            this.processPlayersArray(
                                game.players, playerName));
                        observer.complete();
                    }
                },
                err => {
                    observer.next(this.INVALID_PLAYERNAME);
                    observer.complete();
                });

        });
    }

    protected processPlayersArray(
        players: Array<IGamePlayerEntry>,
        playerName: string): IValidation {

        //this.logger.log('checking player against current list: ');
        //this.logger.object(players);

        let matchingPlayer: IGamePlayerEntry = players.find(
            entry => { return entry.playerName === playerName; }
        );

        // No player found, valid game player name
        if (matchingPlayer) {
            return this.INVALID_PLAYERNAME;
        } else {
            return null;
        }

    }

}

