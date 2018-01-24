// Vendor Imports
import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';

// App Imports
import { GameSessionService } from '../services/gamesession.service';
import { NgbdModalService } from '../services/ngbdmodal.service';
import {
  NodePaths, INewGameRequest,
  ICancelNewGameRequest,
  IJoinGameRequest,
  ICancelJoinGameRequest,
  UserGame
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { FirebaseObservable, EventTypes, SubscribeOptions } from 'miablib/firebaseutil';

/**
 * General development resources about this component
 * http://stackoverflow.com/questions/36985112/angular2-what-is-the-correct-way-to-disable-an-anchor-element
 */

/**
 * Purpose: Landing page is the first page the user sees. This
 * page provides the navigation elemtents (contact/home) as well 
 * as the join game/start game buttons.
 * 
 * Major Component/Elements: join game/start game buttons...
 * This component is also responsible for submitting a "startgamerequest"
 * on behalf of the user who decides to "start game". 
 * 
 * To-do:
 * 1. Converting any Angularfire references to strictly firebase/firebaseobservables
 * 2. Testing to validate client/server side logic
 * 
 */
@Component({
  templateUrl: './landing.component.html',
  styleUrls: ['landing.component.css'],
  // https://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html
  encapsulation: ViewEncapsulation.Emulated
})
export class LandingComponent {

  pendingMoveToLobby: boolean;
  gameCodeSubscription: Subscription;

  constructor(protected modals: NgbdModalService,
    protected gameSession: GameSessionService,
    protected router: Router) { }

  isLinkDisabled() {
    if (this.pendingMoveToLobby || !this.gameSession.online) {
      return true;
    } else {
      return false;
    }
  }

  // Used by the template to request joining a game
  joinGame() {
    this.gameSession.isHosting = false;

    // hide button and display loading gif
    // if error then ask the user to reload the page
    this.router.navigateByUrl('#/gamecode');

  }

  /**
   * Used by the template to request a new hosted game
   */
  hostGame() {

    this.pendingMoveToLobby = true;

    // Loader
    $('.loader-img').fadeIn();
    $('.loader').delay(500).fadeIn('slow');

    this.gameSession.isHosting = true;

    this.attachNewGameSubscription();

    this.submitNewGameRequest();

  }

  protected attachNewGameSubscription() {
    let gameCodeRef = this.gameSession.userRef.child('game/gameCode');
    let options = new SubscribeOptions(gameCodeRef, EventTypes.VALUE);
    options.existsOnly = true;

    let rxFb = new FirebaseObservable(this.gameSession.firebaseApp, options);
    this.gameCodeSubscription = rxFb.getObservable().subscribe(this.newGameCodeCallback);
  }

  protected async submitNewGameRequest() {
    // This happens asynchronously soooo use await
    let gameRequestRef = await this.gameSession.db.ref(NodePaths.NEW_GAME_REQUESTS).push();

    // Need to add push request to the server
    let newGameRequest: IGameRequest = {
      user: this.gameSession.userId,
      id: gameRequestRef.key
    };

    gameRequestRef.set(newGameRequest);

  }

  protected newGameCodeCallback = (gameCode) => {

    let rxFb = new FirebaseObservable(
      this.gameSession.firebaseApp,
      new SubscribeOptions(
        this.gameSession.userRef.child('game'),
        EventTypes.VALUE
      ));

    rxFb.getObservable().take(1).subscribe(this.userGameCallback);

  }

  protected userGameCallback(game: UserGame) {

    this.gameSession.gameCode = game.gameCode;
    this.gameSession.gameId = game.gameId;
    this.gotoGameCodeCmpt();
  }

  /**
   * Call back function that will end the loading image
   * and route the user to the gamecode/username screen
   */
  protected gotoGameCodeCmpt() {

    // Loader
    $('.loader-img').fadeOut();
    $('.loader').delay(1000).fadeOut('slow');

    // stop loading gif and got to lobby
    this.router.navigateByUrl('#/gamecode');
  }

  /*
    protected displayError() {
      this.textModalTitle = "Sorry... :("
      let result = this.modalService.open(this.textModalTemplateRef).result;
      result.then(this.backToLanding);
    }
  
    protected backToLanding = () => {
      this.af.auth.logout();
      this.router.navigateByUrl('#/landing');
    }
    */


}
