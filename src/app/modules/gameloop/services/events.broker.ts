// Vendor Imports 
import { Injectable } from '@angular/core';
import {
    Observable,
    Subject
} from 'rxjs';

// App Imports
import {
    LoggingService,
} from '../../../shared';
import {
    GameTurnDetails
} from './';




/**
 * This class is responsible for maintaining
 * and synchronizing data during a live game
 * 
 */
@Injectable()
export class GameLoopEventsBroker {

    protected _detailsrequest: Subject<void>;
    get detailsrequest(): Observable<void> { return this._detailsrequest.asObservable(); }

    protected _detailspublished: Subject<GameTurnDetails>;
    get detailspublished(): Observable<GameTurnDetails> { return this._detailspublished.asObservable(); }

    protected _gameRouteLanded: Subject<void>;
    get gameRouteLanded(): Observable<void> { return this._gameRouteLanded.asObservable(); }

    protected _submitframe: Subject<void>;
    get submitframe(): Observable<void> { return this._submitframe.asObservable(); }

    protected _subscriptions: Subject<void>;
    get subscriptions(): Observable<void> { return this._subscriptions.asObservable(); }

    protected _currentframe: Subject<number>;
    get currentframe(): Observable<number> { return this._currentframe.asObservable(); }

    protected _startround: Subject<boolean>;
    get startround(): Observable<boolean> { return this._startround.asObservable(); }

    constructor(
        protected logger: LoggingService) {
        this.init();
    }

    protected init() {

        this._detailsrequest = new Subject<void>();

        this._detailspublished = new Subject<GameTurnDetails>();

        this._gameRouteLanded = new Subject<void>();

        this._submitframe = new Subject<void>();

        this._subscriptions = new Subject<void>();

        this._currentframe = new Subject<number>();

        this._startround = new Subject<boolean>();

    }

    public newevent_detailsrequest() {
        this._detailsrequest.next();
    }

    public newevent_detailspublished(details: GameTurnDetails) {
        this._detailspublished.next(details);
    }

    public newevent_gameroutelanded() {
        this._gameRouteLanded.next();
    }

    public newevent_submitframe() {
        this._submitframe.next();
    }

    public newevent_checksubscriptions() {
        this._subscriptions.next();
    }

    public newevent_startround() {
        this._startround.next(true);
    }

    public newevent_currentframe(next: number) {
        this._currentframe.next(next);
    }

}

