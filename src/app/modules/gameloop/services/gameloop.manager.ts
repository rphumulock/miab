// Vendor Imports
import { Injectable } from '@angular/core';

// App Imports
import {
    StartPlayStatus
} from 'miablib/miab';
import {
    RedirectAction
} from '../../session/event-types';
import {
    SessionEventsBroker
} from '../../session';
import {
    LoggingService,
} from '../../../shared';
import {
    GameLoopEventsBroker,
    GameTurnDetails
} from './';


@Injectable()
export class GameLoopManager {

    protected _startRound: boolean;
    get startRound(): boolean { return this._startRound; }

    protected _frameSubmitted: boolean;
    get frameSubmitted(): boolean { return this._frameSubmitted; }

    protected _isFreshValues: boolean;
    get isFreshValues(): boolean { return this._isFreshValues; }

    protected _latestGameTurnDetails: GameTurnDetails;
    get latestGameTurnDetails(): GameTurnDetails { return this._latestGameTurnDetails; }

    protected _errorReceived: boolean;
    get errorReceived(): boolean {
        let val = this._errorReceived;
        this._errorReceived = false;
        return val;
    };

    constructor(
        protected logger: LoggingService,
        protected globalEventsBroker: SessionEventsBroker,
        protected eventsBroker: GameLoopEventsBroker) {
        this.init();
    }

    protected init() {

        // register new game details returned
        this.eventsBroker.detailspublished.subscribe(this.processGameTurnDetails);

        this.eventsBroker.gameRouteLanded.subscribe(() => {
            this._isFreshValues = false;
            this._frameSubmitted = false;
        });

        this.eventsBroker.submitframe.subscribe(
            () => {
                this._startRound = false;
                this._frameSubmitted = true;
            });

        this.eventsBroker.startround.subscribe(
            () => {
                this._startRound = true;
            });

        this.globalEventsBroker.errors.subscribe(() => {
            this._errorReceived = true;
        });

    }

    protected processGameTurnDetails = (details: GameTurnDetails) => {
        this._latestGameTurnDetails = details;
        this._isFreshValues = true;
        if (details.startRound === StartPlayStatus.start) {
            this.logger.log('start round true when game details initially read');
            this._startRound = true;
        }
        this.globalEventsBroker.newevent_redirectqueue({
            source: 'GameLoopManager New GameTurn Details',
            action: RedirectAction.StartRoute
        });
    }

}
