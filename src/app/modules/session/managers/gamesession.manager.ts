// Vendor Imports 
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

// App Imports
import {
    NodePaths,
    StreamUser,
    GameStatus,
    UserGame,
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import {
    FirebaseProjectService,
    LoggingService,
    NgModalService,
    ROUTINGTREE
} from '../../../shared/';
import {
    SubscriptionType,
    SubscriptionTypeEnum,
    SubscriptionEventTypeEnum,
    SessionManagerEventTypeEnum,
    RedirectAction,
} from '../event-types';
import {
    SessionEventsBroker
} from '../';


/**
 * This class is responsible for maintaing game session state
 * data throughout the application. 
 * 
 * This class also provides functionality to re-establish 
 */
@Injectable()
export class GameSessionManager {

    protected _isInitialized: boolean;
    get isInitialized(): boolean { return this._isInitialized; }

    protected _status: GameStatus;
    get status(): GameStatus { return this._status; }

    protected _isHost: boolean;
    get isHosting(): boolean { return this._isHost; }

    protected _playerName: string;
    get playerName(): string { return this._playerName; }

    protected _scrollId: string;
    get scrollId(): string { return this._scrollId; }

    protected _gameId: string;
    get gameId(): string { return this._gameId; }

    protected _playerIndex: number;
    get playerIndex(): number { return this._playerIndex; }

    protected _gameCode: string;
    get gameCode(): string { return this._gameCode; }

    protected _gameComplete: boolean;
    get isGameComplete(): boolean { return this._gameComplete; }

    public readyToStartGame: boolean;

    protected _lastGamePlayedId: string;
    get lastGamePlayed(): string { return this._lastGamePlayedId; }

    constructor(
        protected router: Router,
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService,
        protected modalService: NgModalService,
        protected eventsBroker: SessionEventsBroker,
    ) {
        this.init();
    }

    protected init() {
        this.resetGameValues();
        this.eventsBroker.sessionmanager.subscribe(
            event => {

                switch (event.type) {
                    case SessionManagerEventTypeEnum.GameCompleted:
                        // because the gameloop component will not close the waiting
                        // modal nor route to completed until this event is received
                        this.modalService.close();
                        this.updateLastGamePlayed();
                        this.router.navigate([ROUTINGTREE.completed]);
                        break;
                    case SessionManagerEventTypeEnum.GameStarted:
                        this._status = GameStatus.started;
                        this.router.navigate([ROUTINGTREE.activegame]);
                        break;
                    case SessionManagerEventTypeEnum.Reset:
                        this.resetGameValues();
                        this.eventsBroker.newevent_subscriptions({
                            type: SubscriptionEventTypeEnum.Reset,
                            subscriptions: [SubscriptionTypeEnum.currentgame]
                        });
                        break;
                    case SessionManagerEventTypeEnum.ProcessSession:
                        this.processStreamUser(event.sessionvalue);
                        break;
                }

            });
    }

    protected updateLastGamePlayed() {
        if (this._gameId) {
            this._lastGamePlayedId = this._gameId;
            this._gameComplete = true;
        }
    }

    protected processStreamUser(user: StreamUser) {

        this._isInitialized = true;

        let subscriptionRequests = Array<SubscriptionType>();
        subscriptionRequests.push(SubscriptionTypeEnum.userstatus);

        if (UserGame.noGameAssigned(user.game) === false) {

            let game = user.game;

            this._status = game.status;

            if (game.status === GameStatus.hosting) {
                this._isHost = true;
            }

            if (game.playerName) {
                this._playerName = game.playerName;
            }
            this._gameId = game.gameId;

            if (game.myScrollId) {
                this._scrollId = game.myScrollId;
            }

            if (game.playerIndex) {
                this._playerIndex = game.playerIndex;
            }

            if (game.gameCode) {
                this._gameCode = game.gameCode;
            }

            subscriptionRequests.push(SubscriptionTypeEnum.gamestatus);
        }

        this.eventsBroker.newevent_subscriptions({
            type: SubscriptionEventTypeEnum.Init,
            subscriptions: subscriptionRequests
        });

        this.eventsBroker.newevent_sessionupdated();
        // if a redirect was queue for when game session succeed, 
        // process that redirect
        this.eventsBroker.newevent_redirectqueue({
            source: 'Game Session Service',
            action: RedirectAction.StartRoute,
        });

    }

    getGameRef = (): firebase.database.Reference => {

        if (!this._gameId || this._status === GameStatus.none) {
            return null;
        }

        let gameRef = this.projectsMgr.default.db.ref(
            concatPath([
                NodePaths.GAMES, this._gameId
            ]));

        return gameRef;
    }

    protected resetGameValues = () => {
        this._isInitialized = false;
        this._gameComplete = false;
        this._status = GameStatus.none;
        this._isHost = false;
        this._playerName = null;
        this._gameId = null;
        this._scrollId = null;
        this._playerIndex = null;
        this._gameCode = null;
        this.readyToStartGame = false;
    }

}


