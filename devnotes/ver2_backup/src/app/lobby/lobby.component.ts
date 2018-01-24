import {
    Component,
    OnInit,
    ViewEncapsulation,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import * as firebase from 'firebase';

// App Imports
import { GameSessionService } from '../services/gamesession.service';
import { NgbdModalService } from '../services/ngbdmodal.service';
import { FirebaseObservable, EventTypes, SubscribeOptions } from 'miablib/firebaseutil';
import {
    NodePaths,
    LobbyPlayer,
    LobbyCollection,
    GameState,
    IStartGameRequest
} from 'miablib/miab';
import { concatPath } from 'miablib/global';


/**
 * Purpose: Its a fucking lobby
 * 
 * Major Component/Elements: 
 * - Are the observables that are monitoring users as they join/leave
 * a game
 * 
 * - Start game button that monitors when a game is ready to start
 * and will make a startgamerequest submission
 * 
 * To-do:
 * - Convert angularfire to firebase/firebaseobservables
 * - Test/validate logic
 */
@Component({
    selector: 'lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['lobby.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class LobbyComponent implements OnInit {
    players: LobbyCollection;
    gameCode: string;
    gameSubscription: Subscription;
    usersSubscription: Subscription;
    private readyToStart: boolean;
    textModalTitle: string;


    constructor(
        protected modals: NgbdModalService,
    protected gameSession: GameSessionService,
    protected router: Router){
        //private modalService: NgbModal,
        //@ViewChild('textModal') private textModalTemplateRef: TemplateRef<any>) {
        this.readyToStart = false;
    }

    ngOnInit() {

        if (!this.gameSession.isHosting) {
            $('#startGameLink').hide();
            $('#startGameLink').prop('hidden', true);
        }

        this.gameCode = this.gameSession.gameCode;

        // Get list of registered players
        this.usersSubscription = this.af.database.object(
            this.gameSession.gameRef.child('players')).switchMap(

            (playersObj) => { return this.returnPlayersObject(playersObj)}

            ).subscribe(

            (lobbyPlayers: LobbyCollection) => { this.players = lobbyPlayers; }

            );

        // Monitor the gamestate
        this.gameSubscription = this.af.database.object(
            this.gameSession.gameRef.child('gameState')).subscribe(this.evaluateGameState)
    }

    isLinkDisabled() {
        return !this.gameSession.isHosting && !this.readyToStart;
    }

    startGame() {
        let newStartRequestRef: firebase.database.Reference =
            this.af.database.list(NodePaths.START_GAME_REQUESTS).$ref as firebase.database.Reference;

        newStartRequestRef = newStartRequestRef.push();

        let newStartGameRequest: IStartGameRequest = {
            id: newStartRequestRef.key,
            user: this.gameSession.userId
        };

        newStartRequestRef.set(newStartGameRequest);
    }

    private evaluateGameState = (currentState: GameState) => {

        switch (currentState) {
            case GameState.ready:
                this.readyToStart = true;
                break;
            case GameState.started:
                this.unsubscribe();
                this.router.navigateByUrl('#/textframe');
                break;
            case GameState.init:
                // do nothing;
                return;

            // else 
            default:
                //this.displayError();
                break;
        }

    }

    private unsubscribe() {
        this.gameSubscription.unsubscribe();
        this.usersSubscription.unsubscribe();
    }

    private returnPlayersObject = async (playersObj): Promise<LobbyCollection> => {

        let lobbyPlayers: LobbyCollection = {
            joined: []
        };

        for (let i in playersObj) {

            if (playersObj.hasOwnProperty(i)) {

                let lobbyPlayer = new LobbyPlayer();
                lobbyPlayer.id = playersObj[i];
                lobbyPlayer.index = i;

                await this.af.database.object(concatPath(
                    [
                        NodePaths.STREAM_USERS,
                        lobbyPlayer.id,
                        'game/playerName'
                    ])

                ).take(1).subscribe(name => { lobbyPlayer.name = name; });
            }
        }

        return Promise.resolve(lobbyPlayers);
    }
/*
    private displayError() {
        this.textModalTitle = 'Sorry... :(';
        let result = this.modalService.open(this.textModalTemplateRef).result;
        result.then(this.backToLanding);
    }*/

    private backToLanding = () => {
        this.af.auth.logout();
        this.router.navigateByUrl('#/landing');
    }

}

