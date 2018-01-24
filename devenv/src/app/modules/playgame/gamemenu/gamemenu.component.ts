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
    NgModalComponentTemplate,
    NgModalService,
    DialogOptions, Buttons
} from '../../../shared/ngmodalservice';
import { GameCodeModalComponent, GameCodeModalResult } from '../ngmodal/gamecode.modal';
import { LoggingService } from '../../../shared';


@Component({
    templateUrl: 'gamemenu.component.html',
    styleUrls: ['gamemenu.component.css']
})
export class TestGameMenuComponent {

    gameReady: boolean;
    modalRef: NgbModalRef;
    waitModalRef: NgbModalRef;

    constructor(
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected logger: LoggingService) {
    }

    startGame() {
        this.showWaitingModal(true);
        setTimeout(this.newGameCallback, 3000);
    }

    protected newGameCallback = () => {
        this.closeAllModals();
        this.showGameCodeModal('TESTCODE');
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

    joinGame() {
        this.showGameCodeModal();

        this.modalRef.result
            .then(
            (result: GameCodeModalResult) => {

                this.logger.log('join game modal close event with result received');

                this.logger.object(result);

                this.closeAllModals();

            }).catch(() => {
                this.logger.log('join game modal dismiss event received');

                this.closeAllModals();
            });
    }
}


