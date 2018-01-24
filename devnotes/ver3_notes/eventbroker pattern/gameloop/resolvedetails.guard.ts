// Vendor Imports
import { Injectable } from '@angular/core';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import * as firebase from 'firebase';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import {
    IRouteGuardStatus
} from 'miablib/miab';
import { NgModalService } from '../../../shared/ngmodalservice';
import { LoggingService } from '../../../shared';
import { SessionEventsBroker } from '../../session';
import { GameTurnDetailsService, GameTurnDetails } from '../services/details.service';

@Injectable()
export class GameLoopResolutionGuard implements Resolve<GameTurnDetails> {

    protected modalRef: NgbModalRef;

    constructor(
        protected detailsService: GameTurnDetailsService,
        protected logger: LoggingService,
        protected modalService: NgModalService,
        protected eventsBroker: SessionEventsBroker,
        protected router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GameTurnDetails> {

        this.logger.log('gameloop gameturn details resolution guard invoked');

        let url: string = state.url;

        let status = this.initStatus(url);

        this.modalRef = this.modalService.waiting('Please wait requesting gameturn details', 'Please wait...');

        return this.detailsService.getGameTurnDetails()
            .then(
            currentTurnDetails => {

                this.logger.log('game loop details returned');
                this.logger.object(currentTurnDetails);

                status.value = true;
                this.validateRoute(
                    url, status, currentTurnDetails.currentTurn);
                this.closeModal();
                return currentTurnDetails;
            }).catch(
            err => {
                status.result = false;
                status.value = false;
                status.error_msg = err;
                this.logger.error(status);
                this.logger.error('Unable to retrieve game turn details. Resetting user for new game');
                let errMsg = 'Oh no your game session broke.\n' +
                    'Resetting and Navigating you back to the Game menu.';
                this.closeModal();
                this.eventsBroker.notifyError(errMsg, 40000, true);
                return null;
            });
    }

    /*
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

        this.logger.log('gameloop canactivate gameturn details guard invoked');

        let url: string = state.url;

        let status = this.initStatus(url);

        if (route.paramMap.has('detailsResolved')) {
            status.result = true;
            status.value = true;
            this.logger.object(status);
            return Promise.resolve(true);
        }

        return this.detailsService.getGameTurnDetails()
            .then(
            currentTurnDetails => {
                status.result = false;
                status.value = true;
                this.logger.object(status);
                return this.validateRoute(url);
            }).catch(
            err => {
                status.result = false;
                status.value = true;
                status.error_msg = err;
                this.logger.object(status);
                return false;
            });
    }
    */

    /**
     * Close the please wait modal
     */
    protected closeModal() {
        if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
        }
    }


    protected validateRoute(url: string,
        status: IRouteGuardStatus, currentTurn: number) {

        this.logger.log('validating gameloop route. \
        current turn: ' + currentTurn + ' current url: '
            + url);

        let isEven = currentTurn % 2;

        if (isEven) {
            if (url.indexOf('activegame/2') === -1) {
                status.route_changed = true;
                status.new_route = '/activegame/2';
                status.result = false;
            }
        } else {
            if (url.indexOf('activegame/1') === -1) {
                status.route_changed = true;
                status.new_route = '/activegame/1';
                status.result = false;
            }
        }

        this.logger.object(status);
        if (status.new_route) {
            this.closeModal();
            this.router.navigate([status.new_route]);
        }

    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'game loop canactivatechild guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'current turn details resolved',
            value: null,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}

