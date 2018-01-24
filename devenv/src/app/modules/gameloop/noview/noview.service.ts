// Vendor Imports
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';


// App Imports
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    Game
} from 'miablib/miab';
import { LoggingService } from '../../../shared';

/**
 * Services:
 * Subscribes to the games currentFrame node 
 * waiting for changes. 
 * 
 * When notified it will invoke the callback 
 * functions set when it was setup  
 * 
 * this will also navigate the view to the next 
 * appropriate view (drawing/text)
 */
@Injectable()
export class NoViewService {
    _callback: any;
    set noViewCallback(callbackFunc) { 
        this._callback = callbackFunc;

        setTimeout(this.navHome, 5000);
        setTimeout(this._callback, 7000);
    }

    constructor(protected router: Router) {
    }

    navHome = () => {
        console.log('navigating home from noview service!');
        this.router.navigate(['/']);
    }
}