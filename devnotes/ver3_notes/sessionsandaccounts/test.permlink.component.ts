// Vendor Imports
import {
    Component,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
    FormBuilder
} from '@angular/forms';
import * as firebase from 'firebase';

// App Imports
import { FirebaseProjectService, FirebaseAuthService } from '../firebaseutils';
import { SessionServicesSimpleTestComponent } from './test.simple.component';
import { UserSessionService } from './usersession.service';
import { GameSessionService } from './gamesession.service';
import {
    NodePaths,
    GameState,
    Game,
    Frame,
    Scroll,
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import { AccountUpgradeService } from './account.upgrade.service';
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
 
 login anonymously
 init user session
 init game session
 mock played game (use random generator for id's)
 generate perlink code
 logout

 navigate back with perlink code
 login anonymously
 init user session
 init game sesion
 validate values
 mock played game (using old gamelist)
 validate values

 authenticate with email
 request account upgrade
 validate changed values

 */
@Component({
    template:
    `
    <h4>AuthService Testing Component</h4>
    <br/>
    <button (click)="initUserSessionOnLogin(loginAnonymously)">LogIn Anonymously</button>
    <br/><br/>
    <button (click)="mockPlayedGame()">Mock Played Game</button>
    <br/><br/>
    <button (click)="initUserSessionOnLogin(checkCurrentUser)">Check Current User</button>
    <br/><br/>
    <button (click)="printUserSession()">Print Current UserSession</button>
    <br/><br/>
    <button (click)="initGameSession()">Init GameSession</button>
    <br/><br/>
    <button (click)="printGameSession()">Print Current GameSession</button>
    <br/><br/>
    <button (click)="upgradeAccount()">Upgrade Account</button>
    <br/><br/>
    <button (click)="myLogOut()">LogOut</button>
    <br/><br/>
    <p>Your user permlink user code is {{ currentUrl }};permlink={{ permlinkUserCode }}</p>
    <br/><br/>
    <form role="form" (ngSubmit)="initUserSessionOnLogin(loginWithEmail)" [formGroup]="emailAuthForm" novalidate>
        <div class="form-content">
            <label for="email">Email address:</label>
            <input style="width: 50%;" required id="email" formControlName="email" type="text" placeholder="Enter your email..." class="subscribe-email form-control">
            <br/>
            <label for="password">Password:</label>
            <input style="width: 50%;" required id="password" formControlName="password" type="password" placeholder="...." class="form-control">
            <br/>
            <button class="btn btn-primary-outline" type="submit">Login With Email</button>
            <button class="btn btn-primary-outline" type="submit" (click)="newAccount=true">Create Account</button>
        </div>
    </form>
    <br/>
    <br/><br/>
    <p>----------------------------------------------------------------</p>
    `
})
export class SessionServicesPermlinkTestComponent extends SessionServicesSimpleTestComponent {

    permlinkUserCode: string;
    currentUrl: string;

    constructor(
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected authService: FirebaseAuthService,
        protected projectsMgr: FirebaseProjectService,
        protected formBuilder: FormBuilder,
        protected activeRoute: ActivatedRoute,
        protected acctUpgrader: AccountUpgradeService,
        protected logger: LoggingService) {

        // Instantiate the parent class
        super(
            userSession, gameSession,
            authService, projectsMgr,
            formBuilder, logger);

        activeRoute.url.subscribe(
            urlSegments => {
                let relativeUrl = urlSegments.join('');
                this.logger.log('relative url: ' + relativeUrl);
                let absoluteUrl = window.location.href;
                this.logger.log('absolute url: ' + absoluteUrl);
                let index = absoluteUrl.indexOf(relativeUrl);
                let baseUrl = absoluteUrl.substring(0, index);
                this.logger.log('base url: ' + baseUrl);
                // *** TODO - remove duplicate relative url parameters?  
                this.currentUrl = baseUrl + relativeUrl;
            });

        // Look for the optional permlink code
        activeRoute.params.subscribe(
            (params: Params) => {
                this.permlinkUserCode = params['permlink'];

                if (this.permlinkUserCode) {
                    this.userSession.parsePermlinkCode(
                        this.permlinkUserCode
                    );
                }
            }
        );
    }

    protected getRandomId(length: number): string {
        let text = '';
        let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        possible = possible.toUpperCase();

        for (let i = 0; i < length; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    protected generateMockGame(userId?: string): Game {

        let userIdToUse: string;

        if (userId) {
            userIdToUse = userId;
        } else {
            userIdToUse = this.userSession.userId;
        }

        let game: Game = new Game(
            this.getRandomId(10),
            userIdToUse,
            this.getRandomId(5),
            'testplayer'
        );

        this.logger.log(JSON.stringify(game));
        return game;
    }

    protected generateMockScroll(game: Game, playerIndex: number): Scroll {

        let scroll: Scroll = new Scroll(
            this.getRandomId(10),
            game.players[playerIndex].userId,
            game.players[playerIndex].playerName,
            game.gameId
        );

        let frame: Frame = this.generateMockFrame(game,
            scroll, playerIndex, 0);

        scroll.frames[this.getRandomId(6)] = frame;

        return scroll;

    }

    protected generateMockFrame(
        game: Game, scroll: Scroll,
        playerIndex: number, turn: number): Frame {

        let frame: Frame = new Frame(
            game.players[playerIndex].userId,
            game.gameId,
            scroll.scrollId,
            turn,
            false,
            // firebase.database.ServerValue.TIMESTAMP,
            ('frame value at turn' + turn)
        );

        return frame;

    }

    mockPlayedGame() {

        // New game object
        let game = this.generateMockGame(this.userSession.userId);
        game.gameState = GameState.complete;

        // New scroll object
        let scroll = this.generateMockScroll(game, 0);

        // Write the new scroll to the database
        this.projectsMgr.default.db.ref(concatPath([
            NodePaths.SCROLLS,
            scroll.scrollId
        ])).set(scroll);

        // Update the games scrolls array
        game.scrolls.push(scroll.scrollId);

        // Write the new game to the database
        this.projectsMgr.default.db.ref(concatPath([
            NodePaths.GAMES,
            game.gameId
        ])).set(game);


        // Console log the permink code for this game
        if (this.userSession.isPermlinkUser) {
            this.logger.log('Permlink is previous: ' + this.userSession.userPermlinkCode);
        } else {
            this.userSession.generatePermlinkCode(game.gameCode, 0);
            this.logger.log('New Permlink code is: ' + this.userSession.userPermlinkCode);
            this.permlinkUserCode = this.userSession.userPermlinkCode;

            // this should only apply when a game is completed and the anonymous user
            // is not a previous permlink user
            this.acctUpgrader.previousSession = this.userSession.userId;

        }

    }

    upgradeAccount() {
        //this.acctUpgrader.upgradeAccount(this.userSession);
    }

    initUserSessionOnLogin(callback) {

        let sub = this.authResult.take(1).subscribe(
            (result: firebase.User) => {
                if (result) {
                    this.userSession.setupUserSession(result);
                    this.logger.object(this.userSession);
                }
            }
        );

        callback();
    }

    myLogOut() {
        let sub = this.authResult.take(1).subscribe(
            result => {
                this.userSession.resetUserSession()
            }
        );

        this.logOut();
    }

}
