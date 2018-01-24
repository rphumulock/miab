import { FirebaseAppConfig } from 'miablib/firebaseutil';

/**
 * The firebase api config parameters for our
 * development angular environment project
 */
export const devAppConfig: FirebaseAppConfig = {
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
export const productionAppConfig: FirebaseAppConfig = {
    apiKey: 'AIzaSyCD_eF3IxH0CAHHYc5e6_gR6NSn3fxnuNI',
    authDomain: 'miab-angular.firebaseapp.com',
    databaseURL: 'https://miab-angular.firebaseio.com',
    projectId: 'miab-angular',
    storageBucket: 'miab-angular.appspot.com',
    messagingSenderId: '206798167710'
};

export var webCRMConfig = {
    apiKey: 'AIzaSyBYDB_fBGvDgFwKfrVBcCcKHc-ZhSSQrvo',
    authDomain: 'webcrm-302d1.firebaseapp.com',
    databaseURL: 'https://webcrm-302d1.firebaseio.com',
    projectId: 'webcrm-302d1',
    storageBucket: 'webcrm-302d1.appspot.com',
    messagingSenderId: '807389947262'
};
