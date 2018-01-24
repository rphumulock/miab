import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { landingAppConfig } from './auth.config';

@Injectable()
export class LandingPageService {

    userId: string;
    firebaseApp: firebase.app.App;
    user: firebase.User;
    authenticated: boolean;

    /**
    * onAuthStateChanged returns a non-null function that 
    * can be invoked to remove the subscription to that event
    * https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onAuthStateChanged
    */
    protected unsubscribeFunction;

    constructor() { this.initializeApp(); }

    initializeApp() {

        this.firebaseApp = firebase.initializeApp(landingAppConfig);

        this.unsubscribeFunction = firebase.auth().onAuthStateChanged(this.onAuthCallback);

        // Attempt to get the currently logged in user
        let user: firebase.User = firebase.auth().currentUser;

        if (user) {
            this.onAuthCallback(user);

            // Unsubscribe the on 
            this.unsubscribeFunction();
        } else {
            firebase.auth().signInAnonymously();
        }
    }

    /**
     * Once a valid authencation token is provided from the server
     * with a suers unique ID, the user will then immeditalte
     * check to see if its "StreamUser" objecct was created
     * by the server.
     * @param authEvent 
     */
    private onAuthCallback = (user: firebase.User) => {

        this.unsubscribeFunction();
        // set authentication state
        this.authenticated = true;

        // get and save the users id
        this.userId = user.uid;
    }

}
