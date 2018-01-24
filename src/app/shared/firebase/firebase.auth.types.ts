// Vendor Imports


// App Imports
import {
    FirebaseProject,
} from 'miablib/firebaseutil';


/**
 * Enum of currently supported authentication providers
 */
export enum AuthProviders {
    /**
     * Anonymous auth
     */
    ANONYMOUS = 1,
    /**
     * Email and password auth
     */
    EMAIL = 2
    // FACEBOOK = 3,
    // GOOGLE = 4
}

export interface EmailAuthOptions {
    email: string;
    password: string;
    newAccount: boolean;
}

/**
 * The options required for this authentication service
 */
export interface AuthServiceOptions {
    /**
     * ofType AuthProviders
     */
    provider: AuthProviders;
    firebaseProject?: FirebaseProject; // optional
    emailAuth?: EmailAuthOptions;
}

/**
 * Must check to see if user is anonymous before using this function.
 * This will return "AuthProviders.EMAIL" for both anonymous and email
 * authentication returns since the provider is the same.
 * @param providerId 
 */
export function ParseProvider(providerId: string): AuthProviders {

    switch (providerId) {
        case 'firebase':
            return AuthProviders.EMAIL;

        /*
        case 'facebook.com':
            return AuthProviders.FACEBOOK;
        */
    }
}