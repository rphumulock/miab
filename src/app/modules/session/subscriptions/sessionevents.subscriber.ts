
// App Imports
import { SubscriberResourceManager } from './';

export interface ISessionEventsSubscriber {
    manager: SubscriberResourceManager;
    setupSubscription();
}


