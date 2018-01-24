// Vendor Imports 
import { Injectable } from '@angular/core';

// App Imports
import {
    LoggingService,
    NgModalService,
    ROUTINGTREE
} from '../../../shared/';
import {
    RedirectAction,
    SessionErrorEvent,
    SessionBrokerEventTypeEnum,
} from '../event-types';
import {
    SessionEventsBroker,
} from './globalevents.broker';

/**
 * This class is responsible for maintaing game session state
 * data throughout the application. 
 * 
 * This class also provides functionality to re-establish 
 */
@Injectable()
export class SessionErrorsService {

    constructor(
        protected modalService: NgModalService,
        protected logger: LoggingService,
        protected eventsBroker: SessionEventsBroker,
    ) {

        this.eventsBroker.errors.subscribe(this.sessionError);
    }

    protected sessionError = (event: SessionErrorEvent) => {

        this.logger.error(event.message);

        if (event.error) {
            this.logger.error(event.error);
        }

        // Use a static dialog box, so clicking anywhere on the screen does not 
        // immediately dismiss the modal
        let modal = this.modalService.error(event.message, true);

        let timeToWait = event.resetSession ? 3000 : 4000;

        new Promise(
            (resolve, reject) => {
                setTimeout(resolve, timeToWait);
            })
            .then(
            () => {
                modal.close();
                if (event.redirect) {
                    this.eventsBroker.newevent_redirectqueue({
                        source: 'Session Errors Service',
                        url: event.redirect,
                        action: RedirectAction.NewRedirect
                    });
                } else {
                    this.eventsBroker.newevent_redirectqueue({
                        source: 'Session Errors Service',
                        url: ROUTINGTREE.landing,
                        action: RedirectAction.NewRedirect
                    });
                }

                if (event.resetSession) {
                    this.eventsBroker.newevent_sessionbroker({
                        type: SessionBrokerEventTypeEnum.Reset,
                        showModal: true
                    });
                } else {
                    this.eventsBroker.newevent_sessionbroker({
                        type: SessionBrokerEventTypeEnum.Refresh,
                        showModal: true
                    });
                }

            });
    }

}
