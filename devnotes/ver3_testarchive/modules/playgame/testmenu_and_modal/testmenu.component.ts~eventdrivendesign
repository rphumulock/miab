// Vendor Imports
import {
    Component
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { NgModalService } from '../../../shared/ngmodalservice';
import { GameCodeModalTestComponent, GameCodeModalResult } from './gamecode.modal';
import { LoggingService } from '../../../shared';

@Component({
    templateUrl: 'testmenu.component.html',
    styleUrls: ['testmenu.component.css']

})
export class DesignGameMenuTestComponent {

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

        this.closeAllModals();

        this.waitModalRef = this.modalService.waiting('Please wait setting up game', 'New Game');

        setTimeout(this.closeAllModals, 4000);

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

    joinGame() {

        this.closeAllModals();

        this.modalRef = GameCodeModalTestComponent.show(
            'Join/Start Game', this.modalService);

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


