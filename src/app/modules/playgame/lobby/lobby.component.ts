// Vendor Imports
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    IGamePlayerEntry,
    NodePaths,
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import { GameSessionManager } from '../../session';
import { NgModalService } from '../../../shared/ngmodalservice';
import { LoggingService, FirebaseProjectService } from '../../../shared';


@Component({
    templateUrl: 'lobby.component.html',
    styleUrls: ['lobby.component.css']
})
export class LobbyComponent implements OnInit {

    players: any;
    playerCount: number;
    gameCode: string;
    //readyToStart: boolean;
    waitingModal: NgbModalRef;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected gameSession: GameSessionManager,
        protected logger: LoggingService) {
        this.playerCount = 0; // so its never undefined
        //this.readyToStart = false;
    }

    ngOnInit() {
        this.setupLobbySubscription();
        //this.setupStartGameSubscription();
        this.gameCode = this.gameSession.gameCode;
    }

    submitStartGame() {
        if (!this.gameSession.readyToStartGame || !this.gameSession.isHosting) {
            return;
        }

        this.logger.log('Submitting start game request');

        this.waitingModal = this.modalService.waiting('Starting Game...');

        this.projectsMgr.default.db.ref(concatPath([
            NodePaths.START_GAME_REQUESTS
        ])).push(this.gameSession.gameId)
    }

    protected closeModal = () => {
        if (this.waitingModal) {
            this.waitingModal.close();
        }
    }

    protected setupLobbySubscription() {

        let options: SubscribeOptions = {
            node: this.gameSession.getGameRef().child('players'),
            eventType: EventTypes.VALUE,
            existsOnly: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        this.players =
            rxFb.getObservable()
                .switchMap(
                value => {
                    let players = value as Array<IGamePlayerEntry>;
                    this.playerCount = players.length;
                    /**
                     * This returns an Observable<Array<IGamePlayerEntry>>
                     * 
                     * If you use Observable.from you will get a different result
                     * you will instead get:
                     * Observable<IGamePlayerEntry>
                     */
                    return Observable.of(players);
                });

    }

    /*
    protected setupStartGameSubscription() {

        if (!this.gameSession.isHosting) {
            return;
        }

        let options: SubscribeOptions = {
            node: this.gameSession.getGameRef().child('gameState'),
            eventType: EventTypes.VALUE,
            existsOnly: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        rxFb.getObservable()
            .subscribe(
            (state: GameState) => {
                if (state === GameState.ready) {
                    this.readyToStart = true;
                    return;
                }
            });
    }
    */


}

