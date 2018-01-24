// Vendor Imports
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

// App Imports
import {
    NodePaths, Game,
    MiabUser, UserGameList,
} from 'miablib/miab';
import {
    concatPath, valueAsArray
} from 'miablib/global';
import {
    FirebaseProjectService,
    LoggingService,
} from '../../../shared';
import {
    SessionEventsBroker,
} from '../../session/services';
import {
    UserSessionManager,
} from '../../session/managers';
import {
    UserProfileService
} from '../../session/requestservices';

export let RequestErrors = {
    nouser: 'no miabuser available!',
    nogames: 'user gamelist does not exist!',
}

/**
 * This service can be used to retrieve a players game objects
 * as an array. Also exposes functions that can be used in 
 * other game object related operations
 */
@Injectable()
export class PlayerGamesService {

    protected cachedUser: MiabUser;

    constructor(
        protected projsMgr: FirebaseProjectService,
        protected logger: LoggingService,
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
        protected userProfile: UserProfileService,
    ) { }

    /**
     * Will return a boolean specifying whether or not 
     * a miabuser exists for this user and if there
     * is an associated gamelist of its games.
     * 
     * The reason we only check for a gamelist id and 
     * not the object itelf, is because inbetween checks
     * the object may be updated by the server so you always
     * want the resolution guard to get the most updated
     * copy 
     */
    hasCompletedGames(): Observable<boolean> {
        if (this.useCachedUser()) {
            if (this.cachedUser.gameListId) {
                Observable.of(true);
            } else {
                Observable.of(false);
            }
        } else {
            return this.hasGameList();
        }
    }

    /**
     * Will return a boolean specifying whether or not 
     * a miabuser exists for this user and if there
     * is an associated gamelist of its games.
     * 
     * If a MiabUser object is returned and it does
     * have a a game list, we will cache it to 
     * improve performance
     */
    protected hasGameList(): Observable<boolean> {

        return Observable.defer(
            (): Observable<boolean> => {
                return Observable.create(
                    (observer: Observer<boolean>) => {
                        this.userProfile.getMiabUser()
                            .then(
                            user => {
                                if (!user) {
                                    this.logger.error(RequestErrors.nouser);
                                    observer.next(false);
                                    observer.complete();
                                } else {
                                    // if user object was returned and 
                                    // it there was a gamelist id property
                                    // cache it because its not going to change
                                    if (user.gameListId) {
                                        this.cachedUser = user;
                                        observer.next(true);
                                        observer.complete();
                                    } else {
                                        observer.next(false);
                                        observer.complete();
                                    }
                                }
                            })
                            .catch(
                            err => {
                                this.logger.error(err);
                                observer.next(false);
                                observer.complete();
                            });

                    });
            });

    }

    protected useCachedUser(): boolean {
        if (this.cachedUser) {
            return this.userSession.userId === this.cachedUser.userId;
        }
        return false;
    }

    /**
     * Will return an observable which will go through the process
     * of retreiving a users played games
     */
    getPlayerGames(): Observable<Array<Game>> {

        let user: MiabUser;
        let gameList: UserGameList;

        return Observable.defer(
            (): Observable<Array<Game>> => {
                return Observable.create(
                    (observer: Observer<Array<Game>>) => {

                        let promiseStart: Promise<MiabUser>;

                        if (this.useCachedUser()) {
                            promiseStart = Promise.resolve(this.cachedUser);
                        } else {
                            promiseStart = this.userProfile.getMiabUser();
                        }

                        promiseStart
                            .then(
                            userReturned => {
                                if (!userReturned) {
                                    return Promise.reject(RequestErrors.nouser);
                                }
                                user = userReturned;
                                return this.getUserGameList(user.gameListId);
                            })
                            .then(
                            userList => {
                                gameList = userList;
                                return this.getUserGames(gameList);
                            })
                            .then(
                            details => {
                                observer.next(details);
                                observer.complete();
                            })
                            .catch(
                            err => {
                                this.logger.error(err);
                                observer.error(err);
                                observer.complete();
                            });

                    });
            });

    }

    /**
     * Will return a Promise with the UserGameList object
     * as specified by the provided game list id
     * @param gameListId 
     */
    protected getUserGameList(gameListId: string): Promise<UserGameList> {

        let promise: any = this.projsMgr.default.db.ref(concatPath([
            NodePaths.GAMELISTS,
            gameListId
        ])).once('value')
            .then(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    return Promise.reject(RequestErrors.nogames);
                }

                let gameList: UserGameList = snap.val();
                return Promise.resolve(gameList);
            });

        return promise;

    }

    /**
     * Provided a UserGameList object it will retrieve the Game
     * objects returning a Promise object with an array of said
     * Games
     * @param gameList 
     */
    public getUserGames(gameList: UserGameList): Promise<Array<Game>> {

        let games = new Array<Game>();

        let gamesObservable = Observable.create(
            (observer: Observer<Game>) => {

                let userGames = valueAsArray(gameList.myGames);

                userGames.forEach(
                    (entry, index) => {
                        // let listEntry: IGameListEntry = entry.val;
                        this.getGame(entry.val).then(
                            game => {
                                observer.next(game);

                                if (index === (userGames.length - 1)) {
                                    observer.complete();
                                }
                            })
                            .catch(
                            err => {
                                observer.error(err);
                            });
                    });
            });

        return new Promise(
            (resolve, reject) => {
                gamesObservable
                    .subscribe(
                    game => {
                        games.push(game);
                    },
                    err => {
                        reject(err);
                    },
                    () => {
                        resolve(games);
                    });

            });

    }

    /**
     * Given a game id, this will return a Promise
     * which resolving with the Game object
     * @param gameId 
     */
    public getGame(gameId: string): Promise<Game> {

        let promise: any = this.projsMgr.default.db.ref(
            concatPath([
                NodePaths.GAMES,
                gameId
            ])).once('value')
            .then(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    return Promise.reject('Cannot find the game with id: ' + gameId);
                }

                let game: Game = snap.val();

                let isValid = Game.validateGame(game);
                if (!isValid) {
                    return Promise.reject('The game {' + gameId + '} is invalid!');
                }

                return Promise.resolve(game);
            });

        return promise;

    }

}

