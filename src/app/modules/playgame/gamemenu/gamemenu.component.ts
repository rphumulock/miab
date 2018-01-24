// Vendor Imports
import {
    Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    FirebaseObservable, SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    NodePaths,
    ICancelNewGameRequest,
    IJoinGameRequest,
    JoinRequestStatus
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import {
    RedirectAction,
    SessionBrokerEventTypeEnum,
} from '../../session/event-types';
import {
    SessionEventsBroker,
    GameSessionManager,
    UserSessionManager,
} from '../../session';
import {
    NgModalService,
    FirebaseProjectService,
    ROUTINGTREE,
} from '../../../shared';
import { GameCodeModalComponent, GameCodeModalResult } from '../ngmodal/gamecode.modal';
import { LoggingService } from '../../../shared';

@Component({
    templateUrl: 'gamemenu.component.html',
    styleUrls: ['gamemenu.component.css']
})
export class GameMenuComponent {

    gameReady: boolean;
    modalRef: NgbModalRef;
    waitModalRef: NgbModalRef;
    timeoutTimerRef: number;
    timeoutOrError: boolean;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected gameSession: GameSessionManager,
        protected userSession: UserSessionManager,
        protected eventsBroker: SessionEventsBroker,
        protected logger: LoggingService) {
    }

    startGame() {

        this.closeAllModals();

        this.waitModalRef = this.modalService.waiting(
            'Please wait setting up game... (up to 20secs)', 'New Game');

        let options: SubscribeOptions = {
            node: this.userSession.getUserRef().child('game/gameCode'),
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

        this.timeoutTimerRef = window.setTimeout(this.showErrorMessage, 21000, 'New Game Request Timed Out'); // set timeout

    }

    protected newGameCallback = (gameCode: string) => {

        // we check this asap because it is also responsible 
        // for clearing the timeout callback if we recieve a 
        // reponse. so if we really want to see if we need to 
        // increase the timeout value, we need to log return even
        // when we will be erroring out.
        if (!this.canContinue()) {
            this.logger.log('new game server callback received with gamecode: ' + gameCode);
            return;
        }

        this.logger.log('new game server callback received with gamecode: ' + gameCode);

        this.modalRef = GameCodeModalComponent.show(
            'New Game', this.modalService, gameCode);

        this.modalRef.result
            .then(
            (result: GameCodeModalResult) => {

                this.logger.log('new game modal result received');

                this.logger.log('new game append player game complete...');

                this.closeAllModals();

                this.appendPlayerName(result).subscribe(
                    appendResult => {
                        this.logger.log('new game append player game complete...');
                        this.closeAllModals();
                        this.eventsBroker.newevent_redirectqueue({
                            source: 'New Game Request',
                            action: RedirectAction.NewRedirect,
                            url: ROUTINGTREE.lobby
                        });
                        this.eventsBroker.newevent_sessionbroker({
                            type: SessionBrokerEventTypeEnum.Refresh,
                            showModal: true
                        });
                    },
                    appendErr => {
                        //this.logger.error(appendErr);
                        this.showErrorMessage(appendErr);
                    }
                );
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

    protected closeAllModals = () => {

        if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
        }

        if (this.waitModalRef) {
            this.waitModalRef.close();
            this.waitModalRef = null;
        }
    }

    protected showErrorMessage = (msg: string, err?: any) => {
        this.timeoutOrError = true;

        this.cancelTimeout(); // just in case

        this.closeAllModals();
        this.eventsBroker.newevent_error({
            message: msg,
            error: err,
            redirect: ROUTINGTREE.menu
        });
    }

    protected cancelTimeout() {
        try {
            clearTimeout(this.timeoutTimerRef);
            this.timeoutTimerRef = null;
        } catch (err) {
            this.logger.error('unable to clear timeout!');
            this.logger.error(err);
            this.timeoutTimerRef = null;
        }
    }

    protected canContinue() {
        if (this.timeoutOrError) {
            return false;
        } else {
            this.cancelTimeout();
            return true;
        }
    }

    joinGame() {

        this.closeAllModals();

        this.modalRef = GameCodeModalComponent.show(
            'Join Game', this.modalService);

        this.modalRef.result
            .then(
            (result: GameCodeModalResult) => {

                this.logger.log('join game modal result received');

                this.closeAllModals();

                this.waitModalRef = this.modalService.waiting(
                    'Please wait requesting join game... (up to 20secs)', 'Join Game');

                this.submitJoinGame(result);

            }).catch(
            () => {
                // do nothing 
            });

    }

    protected submitJoinGame(result: GameCodeModalResult) {

        this.logger.log('submitting join game request: ' + JSON.stringify(result));

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

                // we check this asap because it is also responsible 
                // for clearing the timeout callback if we recieve a 
                // reponse. so if we really want to see if we need to 
                // increase the timeout value, we need to log return even
                // when we will be erroring out.
                if (!this.canContinue()) {
                    this.logger.log('join game server call back recevied!');
                    this.logger.log('status returned: ' + JSON.stringify(status));
                    return;
                }

                this.logger.log('join game server call back recevied!');
                this.logger.log('status returned: ' + JSON.stringify(status));


                if (status !== JoinRequestStatus.approved) {
                    this.showErrorMessage('join game status not approved!');
                } else {
                    this.joinGameCallback(result);
                }
            },
            err => {
                //this.logger.error('error on join game request status subscription!');
                this.showErrorMessage('error while attempting to join game', err);
            });

        let joinGameRequest: IJoinGameRequest = {
            gameCode: result.gamecode.toUpperCase(),
            playerName: result.playerName,
            userId: this.userSession.userId,
            status: JoinRequestStatus.submitted
        };

        joinGameRef.set(joinGameRequest);

        // set request timeout
        this.timeoutTimerRef = window.setTimeout(this.showErrorMessage, 21000, 'Join Game Request Timedout');

    }

    protected joinGameCallback = (result: GameCodeModalResult) => {

        this.logger.log('approval callback starting...!');

        this.eventsBroker.newevent_redirectqueue({
            source: 'New Game Request',
            action: RedirectAction.NewRedirect,
            url: ROUTINGTREE.lobby
        });
        this.eventsBroker.newevent_sessionbroker({
            type: SessionBrokerEventTypeEnum.Refresh,
            showModal: true
        });
    }

}


