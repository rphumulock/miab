// Vendor Imports 

// App Imports
import {
    StreamUser,
} from 'miablib/miab';

// Exports
export type SessionManagerEventType = 'process_session' | 'reset' |
    'gamestarted' | 'gamecompleted';

export class SessionManagerEventTypeEnum {
    static ProcessSession: SessionManagerEventType = 'process_session';
    static Reset: SessionManagerEventType = 'reset';
    static GameStarted: SessionManagerEventType = 'gamestarted';
    static GameCompleted: SessionManagerEventType = 'gamecompleted';
}

export interface SessionManagerEvent {
    type: SessionManagerEventType;
    sessionvalue?: StreamUser;
}
