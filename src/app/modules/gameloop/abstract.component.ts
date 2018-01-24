// Vendor Imports
import {
    OnInit,
    AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';


// App Imports
import {
    NgModalService,
} from '../../shared/ngmodalservice';
import {
    SessionEventsBroker,
    GameSessionManager,
} from '../session';
import {
    LoggingService,
    ViewPortManagementService,
    FirebaseProjectService,
    ROUTINGTREE
} from '../../shared';
import {
    GameLoopEventsBroker,
    GameTurnDetails,
    GameLoopManager
} from './services/index';

export abstract class AbstractGameTurnComponent implements OnInit, AfterViewInit {

    details: GameTurnDetails;
    mainMessage: string;

    /*
    initialView = {
        isInitial: true,
        isLandscape: false,
        processed: false
    };
    */

    constructor(
        protected gameloopManager: GameLoopManager,
        protected gameSession: GameSessionManager,
        protected firebaseProjs: FirebaseProjectService,
        protected modalService: NgModalService,
        protected globalEventsBroker: SessionEventsBroker,
        protected eventsBroker: GameLoopEventsBroker,
        protected viewportMgr: ViewPortManagementService,
        protected router: Router,
        protected logger: LoggingService) {
        //viewportMgr.change(true).subscribe(this.monitorOrientation);
        viewportMgr.requestDisableNavUpdates();
    }

    ngOnInit() {
        this.eventsBroker.newevent_gameroutelanded();

        this.eventsBroker.submitframe.subscribe(() => {
            this.submitFrame(false);
        });
    }

    ngAfterViewInit() {
        this.details = this.gameloopManager.latestGameTurnDetails;
        this.processGameTurn();
    }

    submitFrame = (isEarly: boolean) => {

        if (this.gameloopManager.frameSubmitted && !isEarly) {
            this.modalService.close();
            this.routeToNext();
            return;
        }

        let modalMsg = isEarly ?
            'Submitting frame and waiting for next turn...'
            : 'Current turn over, submitting frame';

        this.modalService.waiting(modalMsg, ':)');

        this.processSubmitFrame()
            .then(
            result => {
                if (!isEarly) {
                    this.routeToNext();
                }
            })
            .catch(err => {
                this.globalEventsBroker.newevent_error({
                    message: 'Unable to submit the frame :(!',
                    error: err,
                    resetSession: true
                });
            });
    }

    /*
    protected monitorOrientation = (event: ViewPortEvent) => {
        let isLandscape = event.orientation === OrientationState.landscape;

        if (this.initialView.isInitial) {
            this.initialView.isLandscape = isLandscape;
            this.initialView.isInitial = false;
        } else if (!this.initialView.processed) {
            this.initialView.processed = true;
            if (this.initialView.isLandscape) {
                this.logger.log('requesting change detection!');
                this.logger.log('current url: ' + this.route.snapshot.url);
                let url = '/activegame/' + this.route.snapshot.url;
                //this.router.navigate([url]);
                window.location.reload();
            }
        }

    }
    */

    protected routeToNext() {

        let nextTurn = (this.details.currentTurn + 1);

        /**
         * If the there is no next turn, then just wait for the
         * user game status subscription to receive the 
         * 'completed' game status update
         */
        let nextTurnUnavailable =
            this.details.completedOnGameTurn === nextTurn;

        if (!nextTurnUnavailable) {
            this.modalService.close();
            let isEven = (this.details.currentTurn % 2) === 0;
            if (isEven) {
                this.router.navigate([ROUTINGTREE.textframe]);
            } else {
                this.router.navigate([ROUTINGTREE.drawing]);
            }
        }

    }

    protected abstract processSubmitFrame(): Promise<any>;

    /**
     * This method is responsible for processing the game turn
     * details and displaying the previous frame if applicable.
     * 
     * Will give the users ten seconds before closing the modal
     */
    protected abstract processGameTurn();

}



