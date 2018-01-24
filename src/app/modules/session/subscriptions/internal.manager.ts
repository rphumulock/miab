// Vendor Imports 
import * as firebase from 'firebase';
import {
    Observable,
} from 'rxjs';

// App Imports
import {
    LoggingService,
    FirebaseProjectService
} from '../../../shared/';
import {
    FirebaseObservable,
    SubscribeOptions
} from 'miablib/firebaseutil';

export class SubscriberResourceManager {

    /**
     * Resource Id (game or user id)
     */
    protected resourceId: string;
    /**
     * The reference the subscription is listening to 
     */
    protected options: SubscribeOptions;
    /**
     * The subscription reference object
     * http://reactivex.io/rxjs/class/es6/Subscription.js~Subscription.html
     */
    public subscription;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected logger: LoggingService) { }

    public setupSubscription(
        resourceId: string,
        options: SubscribeOptions,
        force?: boolean): FirebaseObservable {

        let isSameResource =
            this.resourceId === resourceId;

        if (!force) {
            if (this.subscription && isSameResource) {
                return;
            }
        }

        this.unsubscribeListeners();

        this.options = options;

        let fbRx = new FirebaseObservable(
            this.projectsMgr.default.app, options);

        this.resourceId = resourceId;

        return fbRx;
    }

    public unsubscribeListeners() {
        if (this.subscription) {
            try {
                this.resourceId = null;
                this.options = null;
                this.subscription.unsubscribe();
            } catch (err) {
                this.logger.error('error while attempting to unsubcribe');
                this.logger.error(err);
            }
        }
    }

}
