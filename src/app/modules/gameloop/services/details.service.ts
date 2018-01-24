// Vendor Imports
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


// App Imports
import {
    UserGame,
    Frame,
    NodePaths,
    IAssignedScroll,
    Game,
    StartPlayStatus
} from 'miablib/miab';
import {
    SessionEventsBroker,
    GameSessionManager,
    UserSessionManager
} from '../../session';
import { concatPath } from 'miablib/global';
import { LoggingService, FirebaseProjectService } from '../../../shared';
import {
    GameLoopEventsBroker,
} from './';

/**
 * Used primairly by client side code to handle 
 * the game turn/frame logic 
 */
export class GameTurnDetails {
    currentTurn: number;
    assignedScroll: IAssignedScroll;
    previousFrame: Frame;
    completedOnGameTurn: number;
    startRound: StartPlayStatus;
}

/**
 * Services:
 * Will retrieve the current game turn details 
 * including:
 * 
 * - current frame
 * - assigned scroll
 * - any previous frames and their 
 * details if appropriate
 * 
 */
@Injectable()
export class GameTurnDetailsService {

    protected subscriptionsGameId: string;

    constructor(
        protected logger: LoggingService,
        protected userSession: UserSessionManager,
        protected gameSession: GameSessionManager,
        protected projectsMgr: FirebaseProjectService,
        protected eventsBroker: GameLoopEventsBroker,
        protected globalEventsBroker: SessionEventsBroker) {
        this.init();
    }

    protected init() {
        this.eventsBroker.detailsrequest
            .subscribe(this.getGameTurnDetails);
    }

    getGameTurnDetails(): Promise<GameTurnDetails> {

        let valCurrentTurn: number;
        let valAssingedScroll: IAssignedScroll;
        let valPreviousFrame: Frame;
        let theGame: Game;

        let promise: any = this.getValidatedGame()
            .then(
            (game: Game) => {
                valCurrentTurn = game.currentFrame;
                theGame = game;
                return this.getAssignedScroll();
            })
            .then(
            (scroll: IAssignedScroll) => {
                valAssingedScroll = scroll;
                if (valCurrentTurn !== 0) {
                    return this.getPreviousFrame(scroll);
                }
            })
            .then(
            value => {
                let gameTurnDetails: GameTurnDetails = {
                    currentTurn: valCurrentTurn,
                    assignedScroll: valAssingedScroll,
                    previousFrame: valCurrentTurn !== 0 ? valPreviousFrame : null,
                    completedOnGameTurn: theGame.gameLoopStatus.completeOnTurn,
                    startRound: theGame.gameLoopStatus.startPlay
                };

                this.eventsBroker.newevent_checksubscriptions();

                return gameTurnDetails;
            })
            .catch(
            err => {
                let errMsg = 'Unable to get the current turns details :(!' +
                    '\nResetting and Navigating you back to the Game menu.';

                this.globalEventsBroker.newevent_error({
                    message: errMsg,
                    error: err,
                    resetSession: true,
                });
            });

        return promise;
    }

    protected getValidatedGame(): Promise<Game> {
        let promise: any = this.gameSession.getGameRef().once('value').then(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    // this expects the catch statement to do the 
                    // appropriate error handling...
                    return Promise.reject('Unable to retreive game object!');
                }

                let game: Game = snap.val();

                if (!Game.validateActiveGame(game)) {
                    return Promise.reject('Invalid game object!');
                }

                return game;
            });

        return promise;
    }

    protected getAssignedScroll(): Promise<IAssignedScroll> {

        let promise: any =
            this.userSession.getUserRef().child('game').once('value')
                .then(
                (snap: firebase.database.DataSnapshot) => {
                    if (!snap.exists()) {
                        return Promise.reject('User game object missing!');
                    }

                    let game: UserGame = snap.val();

                    if (!UserGame.validateUserGame(game)) {
                        this.logger.error(game);
                        return Promise.reject('User game object is invalid!');
                    }

                    if (!game.currentScroll) {
                        return Promise.reject(
                            'User game object is missing a current scroll assignment!');
                    }

                    return Promise.resolve(game.currentScroll);

                });

        return promise;
        // return (promise as Promise<IAssignedScroll>); // <- also works...

    }

    protected getPreviousFrame(scroll: IAssignedScroll): Promise<Frame> {

        let scrollRef = this.projectsMgr.default.db.ref(concatPath([
            NodePaths.SCROLLS,
            scroll.scrollId,
            'frames'
        ]));

        let promise: any =
            scrollRef.once('value')
                .then(
                (snap: firebase.database.DataSnapshot) => {
                    if (!snap.exists()) {
                        return Promise.reject('Could not find scroll!');
                    }

                    let frames: Array<Frame> = snap.val();

                    try {
                        let lastFrame = frames.pop();
                        return Promise.reject(lastFrame);
                    } catch (err) {
                        return Promise.reject(err);
                    }

                });

        return promise;

    }


}
