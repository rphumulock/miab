// Vendor Imports

// App Imports

// Exports
export type SubscriptionType =
    'gamestatus' | 'userstatus' | 'userpresence' |
    'currentframe' | 'startround' | 'all' | 'currentgame';
export class SubscriptionTypeEnum {
    static all: SubscriptionType = 'all';
    static currentgame: SubscriptionType = 'currentgame';
    static gamestatus: SubscriptionType = 'gamestatus';
    static userstatus: SubscriptionType = 'userstatus';
    static userpresence: SubscriptionType = 'userpresence';
    static currentframe: SubscriptionType = 'currentframe';
    static startround: SubscriptionType = 'startround';
};

export type SubscriptionEventType = 'init' | 'reset';
export class SubscriptionEventTypeEnum {
    static Init: SubscriptionEventType = 'init';
    static Reset: SubscriptionEventType = 'reset';
}

export interface SubscriptionsManagementEvent {
    type: SubscriptionEventType;
    subscriptions: Array<SubscriptionType>;
}

