// Vendor Imports
import {
    Injectable
} from '@angular/core';
import {
    Router, NavigationExtras
} from '@angular/router';

// App Imports

import {
    LoggingService
} from '../../../shared';
import {
    RedirectAction,
    RedirectOptions
} from '../event-types';
import {
    SessionEventsBroker
} from '../services';

// Exports
/*
export type RedirectQueueEnum =
    'userauth' | 'gamesession' |
    'completedgame' | 'startround';

export class RedirectQueue {
    static userauth: RedirectQueueEnum = 'userauth';
    static gamesession: RedirectQueueEnum = 'gamesession';
    static completedgame: RedirectQueueEnum = 'completedgame';
    static startround: RedirectQueueEnum = 'startround';
};
*/


@Injectable()
export class RedirectQueueManager {

    //protected collection: Map<RedirectQueue, string>;
    protected queue = Array<RedirectOptions>(1);

    constructor(
        protected logger: LoggingService,
        protected router: Router,
        protected eventsBroker: SessionEventsBroker) {
        //this.collection = new Map();
        eventsBroker.redirectqueue.subscribe(this.processQueueRequest);
    }

    protected processQueueRequest = (opts: RedirectOptions) => {

        this.logger.log('redirect queue received request');
        this.logger.object(opts);

        switch (opts.action) {
            case RedirectAction.ClearQueue:
                this.queue = new Array<RedirectOptions>(1);
                //this.collection.delete(opts.queue);
                break;

            case RedirectAction.NewRedirect:
                if (opts.defer) {
                    if (this.queue.length === 0) {
                        this.queue[0] = opts;
                    }
                } else {
                    this.queue[0] = opts;
                }
                //this.collection.set(opts.queue, opts.url);
                break;

            case RedirectAction.StartRoute:
                let queuedRedirect = this.queue.pop();
                this.logger.log('redirect queue start route requested.: ' +
                    JSON.stringify(queuedRedirect));
                if (queuedRedirect) {
                    let navExtras: NavigationExtras = {
                        queryParamsHandling: 'preserve',
                        preserveFragment: true
                    };
                    this.router.navigate([queuedRedirect.url], navExtras);
                }
                /*
                let queuedUrl = this.collection.get(opts.queue);
                this.logger.object(this.collection);
                this.collection.clear();
                */
                break;
        }
    }

};
