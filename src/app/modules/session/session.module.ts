// Required Imports
import {
    NgModule
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';

// App Imports
import {
    LoggingService,
    FirebaseProjectService,
} from '../../shared';
import {
    SessionEventsBroker,
    AuthEventsService,
    SessionErrorsService,
    RedirectQueueManager
} from './services';
import {
    UserSessionManager,
    GameSessionManager,
    SubscriptionsManager,
} from './managers';
import {
    GameSessionBroker,
    UserProfileService
} from './requestservices';
import {
    SubscriberResourceManager,
    UserPresenceSubscriber,
    GameStatusSubscriber,
    UserStatusSubscriber
} from './subscriptions';
import {
    RouteCorrectionGuard,
    UserSessionGuard,
    GameSessionGuard
} from './guards';
import {
    SessionBootstrapManager
} from './bootstrap.manager';


// App Services
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
    /**
     * To share modules, components, directives or pipes, you 
     * must explicity re-export them from a feature module if other
     * modules are expected to have access and use them
     * 
     * You can also list export modules without this module needing it
     * nor importing it.
     */
    exports: [
    ],
    /**
     * Declare out reusable component template
     */
    declarations: [
    ],
    /**
     * Add it as an entry template so Angular compiler does not remove
     * its references. 
     * https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-entry-component-defined
     */
    entryComponents: [
    ],
    /**
     * The root module and the feature module share the same execution context. 
     * They share the same dependency injector, 
     * which means the services in one module are available to all.
     * 
     * Do not specify app-wide singleton providers in a shared module. 
     * A lazy-loaded module that imports that shared module makes its own copy of the service.
     * 
     * This current design works for us because we only import this module once
     * in the root module
     * 
     * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
     */
    providers: [
        // services
        SessionEventsBroker,
        RedirectQueueManager,
        SessionErrorsService,
        AuthEventsService,
        // managers
        UserSessionManager,
        GameSessionManager,
        SubscriptionsManager,
        // session broker
        GameSessionBroker,
        // user profile service
        UserProfileService,
        // subscriptions
        {
            provide: SubscriberResourceManager,
            useFactory: (projectsMgr, logger) => {
                return new SubscriberResourceManager(projectsMgr, logger);
            },
            deps: [FirebaseProjectService, LoggingService]
        },
        UserPresenceSubscriber,
        GameStatusSubscriber,
        UserStatusSubscriber,
        // guards
        RouteCorrectionGuard,
        UserSessionGuard,
        GameSessionGuard,
        // global bootstrap class
        SessionBootstrapManager
    ]
})
export class SessionManagementModule {}

