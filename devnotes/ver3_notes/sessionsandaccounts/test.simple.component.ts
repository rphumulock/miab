// Vendor Imports
import {
    Component
} from '@angular/core';
import {
    FormBuilder
} from '@angular/forms';

// App Imports
import {
    FirebaseProjectService,
    FirebaseAuthService,
} from '../firebaseutils';
import {
    AuthServiceTestComponent
} from '../firebaseutils/test.component';
import { UserSessionService } from './usersession.service';
import { GameSessionService } from './gamesession.service';
import {
    GameStatus
} from 'miablib/miab';
import { LoggingService } from '../../shared/';

/**
 * Purpose: Use to test the user and game session services 
 * 
 * To use this, add it any of your modules import arrays and reference it
 * in your templates however you want to...
 * 
 * e.g: add it to your routes
 * 
 * To-do:
 * 
 
 login anonmously 
 init usersession
 init gamesession
 validate session values
 validate streamuser values
 logout


 
 login anonmously 
 init usersession
 init gamesession
 validate session values
 validate streamuser values
 validate miabuser values

 */
@Component({
    template:
    `
    <h4>AuthService Testing Component</h4>
    <button (click)="loginAnonymously()">LogIn Anonymously</button>
    <br/>
    <button (click)="checkCurrentUser()">Check Current User</button>
    <br/>
    <button (click)="printUserSession()">Print Current UserSession</button>
    <br/>
    <button (click)="initUserSession()">Init UserSession</button>
    <br/>
    <button (click)="printGameSession()">Print Current GameSession</button>
    <br/>
    <button (click)="initGameSession()">Init GameSession</button>
    <br/>
    <button (click)="logOut()">LogOut</button>
    `
})
export class SessionServicesSimpleTestComponent extends AuthServiceTestComponent {

    constructor(
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected authService: FirebaseAuthService,
        protected projectsMgr: FirebaseProjectService,
        protected formBuilder: FormBuilder,
        protected logger: LoggingService) {

        // Instantiate the parent class
        super(authService, projectsMgr, formBuilder, logger);
    }

    printUserSession() {
        this.logger.object(this.userSession);
    }

    initUserSession() {
        if (!this.loggedIn ) {
            this.logger.log('You must login to test the user session service');
            return;
        }

        this.userSession.setupUserSession(
            this.lastUserReturned);

        this.logger.object(this.userSession);
    }

    printGameSession() {
        this.logger.object(this.gameSession);
    }

    initGameSession() {

        if (!this.loggedIn) {
            this.logger.log('You must login to test the game session service');
            return;
        }

        let observerable = this.gameSession.initStreamUser();

        observerable.subscribe(
            (status: GameStatus) => {
                this.logger.log('Returned GameStatus: ' + status);
                this.logger.object(this.gameSession);
            }
        );
    }

}
