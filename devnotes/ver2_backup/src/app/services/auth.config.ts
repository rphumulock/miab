'use strict';

import {AuthProviders, AuthMethods} from 'angularfire2';

/**
 * The firebase api config parameters 
 * landing page
 */
export const landingAppConfig = {
    apiKey: 'AIzaSyC82BxMHuTzYsXxq-pqOTKDGexPTwbdMEQ',
    authDomain: 'miablanding.firebaseapp.com',
    databaseURL: 'https://miablanding.firebaseio.com',
    projectId: 'miablanding',
    storageBucket: 'miablanding.appspot.com',
    messagingSenderId: '1062005494662'
};

/**
 * The firebase api config parameters for our
 * development angular environment project
 */
export const devAppConfig = {
    apiKey: 'AIzaSyBQHZuhCKplCYc_9k0FLT63mmULm5BGvvI',
    authDomain: 'miab-angular-dev.firebaseapp.com',
    databaseURL: 'https://miab-angular-dev.firebaseio.com',
    projectId: 'miab-angular-dev',
    storageBucket: 'miab-angular-dev.appspot.com',
    messagingSenderId: '817180016348'
};

/**
 * The firebase api config parameters for our
 * production angular environment project
 */
export const productionAppConfig = {
    apiKey: 'AIzaSyCD_eF3IxH0CAHHYc5e6_gR6NSn3fxnuNI',
    authDomain: 'miab-angular.firebaseapp.com',
    databaseURL: 'https://miab-angular.firebaseio.com',
    projectId: 'miab-angular',
    storageBucket: 'miab-angular.appspot.com',
    messagingSenderId: '206798167710'
};

/**
 * Authentication providers for Angularfire2
 */
export const myFirebaseAuthConfig = {
  provider: AuthProviders.Anonymous,
  method: AuthMethods.Anonymous
};



