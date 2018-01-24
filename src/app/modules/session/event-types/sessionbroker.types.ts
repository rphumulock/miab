// Vendor Imports

// App Imports

// Exports
export type SessionBrokerEventType = 'reset' | 'refresh' | 'init';

export class SessionBrokerEventTypeEnum {
    static Reset: SessionBrokerEventType = 'reset';
    static Refresh: SessionBrokerEventType = 'refresh';
    static Init: SessionBrokerEventType = 'init';
};

export interface SessionBrokerEvent {
    type: SessionBrokerEventType;
    showModal: boolean;
};
