// Vendor Imports
import {
    Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { Observable, Observer } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import {
    FirebaseObservable, SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    NodePaths,
    IGamePlayerEntry,
    ICancelNewGameRequest,
    IJoinGameRequest,
    JoinRequestStatus,
    ICancelJoinGameRequest,
    GameStatus
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import {
    UserSessionService,
    GameSessionService
} from '../../session';
import {
    FirebaseProjectService
} from '../../../core/firebaseutils';
import {
    NgModalComponentTemplate,
    NgModalService,
    DialogOptions, Buttons
} from '../../../shared/ngmodalservice';
import { GameCodeModalComponent, GameCodeModalResult } from '../ngmodal/gamecode.modal';
import { LoggingService } from '../../../shared';


@Component({
    templateUrl: 'gamemenu.component.html'
})
export class TestGameMenuComponent {

    gameReady: boolean;
    modalRef: NgbModalRef;
    waitModalRef: NgbModalRef;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected logger: LoggingService) {
    }

    startGame() {

        this.showWaitingModal(true);

        let options: SubscribeOptions = {
            node: this.gameSession.getUserRef().child('game/gameCode'),
            eventType: EventTypes.VALUE,
            existsOnly: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        rxFb.getObservable()
            .take(1)
            .subscribe(gameCode => {
                this.newGameCallback(gameCode);
            });

        this.logger.log('submitting start game request..');

        this.projectsMgr.default.db.ref(concatPath([
            NodePaths.NEW_GAME_REQUESTS,
        ])).push(this.userSession.userId).onDisconnect().cancel();
    }

    protected newGameCallback = (gameCode: string) => {

        this.logger.log('new game server callback received with gamecode: ' + gameCode);

        this.closeAllModals();

        this.showGameCodeModal(gameCode);

        this.modalRef.result
            .then(
            (result: GameCodeModalResult) => {

                this.logger.log('new game modal result received');

                this.gameSession.refreshStreamUserValues()
                    .subscribe(
                    (status: GameStatus) => {
                        if (status === GameStatus.hosting) {
                            this.appendPlayerName(result).subscribe(
                                appendResult => {
                                    this.logger.log('new game append player game complete...');
                                    this.router.navigate(['lobby'], { relativeTo: this.route });
                                },
                                appendErr => {
                                    this.logger.log(appendErr);
                                    this.showErrorMessage();
                                    this.sendCancelNewGame(gameCode);
                                }
                            );
                        }
                    },
                    err => {
                        this.logger.log(err);
                        this.showErrorMessage();
                        this.sendCancelNewGame(gameCode);
                    });
            })
            .catch(
            dismissed => {
                this.sendCancelNewGame(gameCode);
            });

    }

    protected appendPlayerName(result: GameCodeModalResult): Observable<boolean> {

        this.logger.log('attempting to update new game host player name');

        return Observable.create(
            (observer: Observer<boolean>) => {

                let ref = this.gameSession.getGameRef().child('players/0');

                ref.once('value', snap => {

                    if (snap.exists()) {

                        this.logger.log('current value: \n' + JSON.stringify(snap.val()));

                        let entry: IGamePlayerEntry = snap.val();
                        ref.update({ playerName: result.playerName });
                        observer.next(true);
                        observer.complete();
                    } else {
                        observer.error('Hosting player entry is missing!');
                    }
                });
            }
        );
    }

    protected sendCancelNewGame(gameCode) {

        let cancelGameRequest: ICancelNewGameRequest = {
            userId: this.userSession.userId,
            gameCode: gameCode
        };

        this.projectsMgr.default.db.ref(
            concatPath([NodePaths.CANCEL_NEWGAME_REQUESTS])
        ).push(cancelGameRequest);

    }

    protected closeAllModals() {

        if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
        }

        if (this.waitModalRef) {
            this.waitModalRef.close();
            this.waitModalRef = null;
        }
    }

    protected showWaitingModal(isHosting: boolean) {

        let title = isHosting ? 'New Game' : 'Join Game';
        let buttons: Array<Buttons> = [];

        let msg = isHosting ? 'Please wait setting up game' : 'Please wait requesting join game';
        let options: DialogOptions = new DialogOptions(title, buttons, msg);
        options.imgSrcUrl = '../img/loading.gif';
        options.ngbOptions = { backdrop: 'static' };

        this.waitModalRef = this.modalService.show(NgModalComponentTemplate, options);

    }

    protected showGameCodeModal(gameCode?: string) {

        let title = gameCode ? 'New Game' : 'Join Game';
        let buttons: Array<Buttons> = [
            Buttons.crossClose,
            Buttons.submit
        ];

        let options: DialogOptions = new DialogOptions(title, buttons);

        this.modalRef = this.modalService.show(GameCodeModalComponent, options);

        if (gameCode) {
            let compt = this.modalRef.componentInstance as GameCodeModalComponent;
            compt.setGameCode(gameCode);
        }

    }

    protected showErrorMessage() {

        this.closeAllModals();

        let title = 'Oh No!';
        let buttons: Array<Buttons> = [Buttons.crossClose];

        let msg = 'Oh no something went wrong!';
        let options: DialogOptions = new DialogOptions(title, buttons, msg);
        //options.imgSrcUrl = '../img/loading.gif'; // Oh No Image!

        this.modalRef = this.modalService.show(NgModalComponentTemplate, options);

        this.modalRef.result
            .then(
            () => {
                window.location.reload();
            })
            .catch(
            () => {
                window.location.reload();
            });
    }

    joinGame() {

        this.showGameCodeModal();

        this.modalRef.result
            .then(
            (result: GameCodeModalResult) => {

                this.logger.log('join game modal result received');

                this.closeAllModals();

                this.showWaitingModal(false);

                this.submitJoinGame(result);

            });

    }

    protected submitJoinGame(result: GameCodeModalResult) {


        this.logger.log('submitting join game request: \n' + JSON.stringify(result));


        let joinGameRef = this.projectsMgr.default.db.ref(concatPath([
            NodePaths.JOIN_GAME_REQUESTS
        ])).push();

        joinGameRef.onDisconnect().cancel();

        let options: SubscribeOptions = {
            node: joinGameRef.child('status'),
            eventType: EventTypes.VALUE
            //existsOnly: true
        };

        let rxFb = new FirebaseObservable(this.projectsMgr.default.app, options);

        rxFb.getObservable()
            .filter(
            (status: JoinRequestStatus) => {

                this.logger.log(
                    'join request monitoring event received: '
                    + JSON.stringify(status));


                if (!status) {
                    return false;
                }

                switch (status) {

                    case JoinRequestStatus.submitted:
                    case JoinRequestStatus.acknowledged:
                        return false;

                    default:
                        joinGameRef.update({ status: JoinRequestStatus.acknowledged });
                        return true;
                }
            })
            .take(1)
            .subscribe(
            (status: JoinRequestStatus) => {


                this.logger.log('join game server call back recevied!');
                this.logger.log('status returned: ' + JSON.stringify(status));


                if (status !== JoinRequestStatus.approved) {

                    this.closeAllModals();
                    this.showErrorMessage();
                } else {
                    this.joinGameCallback(result);
                }
            },
            err => {
                this.logger.error('error on join game request status subscription!');
                this.logger.error(err);
            });

        let joinGameRequest: IJoinGameRequest = {
            gameCode: result.gamecode,
            playerName: result.playerName,
            userId: this.userSession.userId,
            status: JoinRequestStatus.submitted
        };

        joinGameRef.set(joinGameRequest);

    }

    protected joinGameCallback = (result: GameCodeModalResult) => {

        this.logger.log('approval callback starting...!');

        this.logger.log('refreshing my game session object');
        this.gameSession.refreshStreamUserValues()
            .subscribe(
            (status: GameStatus) => {
                if (status === GameStatus.inqueue) {
                    this.closeAllModals();
                    this.router.navigate(['lobby'], { relativeTo: this.route });
                } else {
                    this.logger.error('streamUser values mismatch with join game approval response');
                    this.showErrorMessage();
                    this.sendCancelJoinGame(result);
                }
            },
            err => {
                this.logger.error(err);
                this.showErrorMessage();
                this.sendCancelJoinGame(result);
            });
    }

    protected sendCancelJoinGame(result: GameCodeModalResult) {

        let cancelJoinGameRequest: ICancelJoinGameRequest = {
            userId: this.userSession.userId,
            gameCode: result.gamecode
        };

        this.projectsMgr.default.db.ref(
            concatPath([NodePaths.CANCEL_JOINGAME_REQUESTS])
        ).push(cancelJoinGameRequest);

    }
}


