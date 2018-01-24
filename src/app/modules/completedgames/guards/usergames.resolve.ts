// Vendor Imports
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Resolve,
    Router
} from '@angular/router';
import { Observable, Observer } from 'rxjs';

// App Imports
import {
    Game,
    IUserGamesCollection,
    IRouteGuardStatus
} from 'miablib/miab';
import {
    LoggingService,
    NgModalService
} from '../../../shared';
import {
    UserSessionManager,
    GameSessionManager,
    UserProfileService
} from '../../session';
import {
    PlayerGamesService,
    RequestErrors
} from '../services/playergames.service';
import {
    GameDetailsService
} from '../services/gamedetails.service';


@Injectable()
export class UserGamesResolveGuard implements Resolve<IUserGamesCollection> {

    protected status: IRouteGuardStatus;

    constructor(
        protected userSession: UserSessionManager,
        protected gameSession: GameSessionManager,
        protected playerGamesService: PlayerGamesService,
        protected gameDetailsService: GameDetailsService,
        protected userProfile: UserProfileService,
        protected router: Router,
        protected modalService: NgModalService,
        protected logger: LoggingService) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<IUserGamesCollection> {

        this.logger.log('completed games resolution guard ');

        let collection: IUserGamesCollection;
        this.status = this.initStatus(state.url);

        return Observable.create(
            (observer: Observer<IUserGamesCollection>) => {

                this.playerGamesService.getPlayerGames()
                    .subscribe(
                    games => {
                        collection = {
                            Games: games,
                            LastPlayedGame: this.getLastPlayedGame(games),
                            LastPlayedScrolls: null,
                            GameCode: null
                        };

                        this.gameDetailsService.getScrolls(
                            collection.LastPlayedGame).subscribe(
                            scrolls => {
                                collection.LastPlayedScrolls = scrolls;
                                if (this.userSession.isAnonymous) {
                                    this.getGameCode(observer, collection);
                                } else {
                                    this.status.result = true;
                                    this.status.value = collection;
                                    this.logger.object(this.status);
                                    observer.next(collection);
                                    observer.complete();
                                }
                            },
                            err => {
                                this.logger.error('caught in resolve inner error handler');
                                this.handleError(err, observer);
                            });

                    },
                    err => {
                        this.logger.error('caught in resolve outer error handler');
                        this.handleError(err, observer);
                    });
            });

    }

    protected handleError(
        err: any, observer: Observer<IUserGamesCollection>) {
        // update the guard sstatus object
        this.status.result = false;
        this.status.error_msg = err;
        this.logger.object(this.status);

        // process the error received
        let userMsg: string;
        let title = 'My Games';
        if (err === RequestErrors.nouser) {
            userMsg = 'No user games available to display.';
        } else {
            title += ' - Error';
            userMsg = 'Unable to currently get your played games. Please try again!';
        }

        // log error and display user message
        this.logger.error(err);
        let modalRef = this.modalService.error(userMsg, false, title, 4000);
        modalRef.result
            .then(() => { this.router.navigate(['/game/menu']); })
            .catch(() => { this.router.navigate(['/game/menu']); });

        // complete the observable
        observer.error(err);
        observer.complete();
    }


    protected getLastPlayedGame(games: Array<Game>): Game {

        let lastPlayedGame: Game;

        for (let i = 0; i < games.length; i++) {
            let game = games[i];

            if (this.gameSession.lastGamePlayed) {
                if (game.gameId === this.gameSession.lastGamePlayed) {
                    return game;
                }
            }

            if (!lastPlayedGame) {
                lastPlayedGame = game;
                continue;
            };

            let currentGameTimestamp = new Date(game.timeStamp as any);
            let lastPlayedGameTimestamp = new Date(lastPlayedGame.timeStamp as any);

            if (lastPlayedGameTimestamp.getTime() < currentGameTimestamp.getTime()) {
                lastPlayedGame = game;
            }
        }

        return lastPlayedGame;
    }

    /**
     * Will retrieve the current users MiabUser object to 
     * retrieve the generated gamecode
     * @param observer - Observer for IUserGamesCollection
     * @param collection - the prebuilt IUserGamesCollection
     */
    protected getGameCode(
        observer: Observer<IUserGamesCollection>,
        collection: IUserGamesCollection) {

        this.userProfile.getMiabUser().then(
            miabUser => {

                if (!miabUser) {
                    this.logger.error(
                        'on completed games, getMiabUser()\
                         returned an empty MiabUser for the user: ' +
                        this.userSession.userId);
                } else {
                    collection.GameCode = miabUser.gameCode ? miabUser.gameCode : null;
                }

                this.status.result = true;
                this.status.value = collection;
                this.logger.object(this.status);
                observer.next(collection);
                observer.complete();
            }).catch(
            err => {
                this.status.result = true;
                this.status.value = collection;
                this.status.error_msg = err;
                this.logger.object(this.status);
                this.logger.error(err);
                observer.next(collection);
                observer.complete();
            });

    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'completed games resolution guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'non-null IUserGamesCollection',
            value: null,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}

