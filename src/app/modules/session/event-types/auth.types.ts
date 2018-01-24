// Vendor Imports

// App Imports
import {
    AuthServiceOptions,
} from '../../../shared';

// Exports
export type AuthType = 'login' | 'logout' |
    'anonymous' | 'currentoranonymous' | 'current';

export class AuthTypeEnum {
    static login: AuthType = 'login';
    static logout: AuthType = 'logout';
    static anonymous: AuthType = 'anonymous';
    static current: AuthType = 'current';
    static currentOrAnonymous: AuthType = 'currentoranonymous';
}

export interface AuthEvent {
    type: AuthType;
    args?: AuthServiceOptions;
    redirect?: string;
    background?: boolean;
}

