// Vendor Imports
import { Injectable } from '@angular/core';


import { devAppConfig, productionAppConfig, webCRMConfig } from './auth.config';
import { FirebaseAppConfig } from 'miablib/firebaseutil';


export let ROUTINGTREE = {
    landing: '/landing',
    error: '/error',
    contact: '/contact',

    // game menu
    menu: '/game/menu',
    lobby: '/game/lobby',

    // accounts 
    accounts: '/accounts',
    login: '/accounts/login',
    signup: '/accounts/signup',
    verify: '/accounts/verify',
    profile: '/accounts/profile',
    resetrequest: '/accounts/reset/request',
    resetfinish: '/accounts/reset/finish',

    // gameloop
    activegame: '/activegame',
    drawing: '/activegame/1',
    textframe: '/activegame/2',

    // completed
    completed: '/completed',

};

/**
 * Application wide constants provided to the entire
 * application via a root injected provider
 */
@Injectable()
export class Configuration {

    get TITLE(): string { return 'Message In A Bottle'; }

    get FIREBASE_DEV_PROJECT(): FirebaseAppConfig { return devAppConfig; }

    get FIREBASE_PRODUCTION_PROJECT(): FirebaseAppConfig { return productionAppConfig; }

    get FIREBASE_WEBCRM_PROJECT(): FirebaseAppConfig { return webCRMConfig; }

    get REMOTELOGGINGURL(): string { return 'https://www.miabgame.com/logging'; }

    get APPROUTING(): any { return ROUTINGTREE; }

};



