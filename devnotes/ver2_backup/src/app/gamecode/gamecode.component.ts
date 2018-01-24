// Vendor Imports
import {
  Component,
  OnInit,
  ViewEncapsulation,
  TemplateRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import * as $ from 'jquery';
//import * as firebase from 'firebase';

// App Imports
import { GameSessionService } from '../services/gamesession.service';
import { NgbdModalService } from '../services/ngbdmodal.service';
import { FirebaseObservable, EventTypes, SubscribeOptions } from 'miablib/firebaseutil';
import {
  NodePaths,
  IJoinGameRequest,
  UserGame,
  JoinRequestStatus
} from 'miablib/miab';
import { concatPath } from 'miablib/global';

/**
 * Purpose: Provide a input forms for users to submit a player name
 * and a game code. If hosting the gamecode is automatically populated 
 * and locked. 
 * 
 * Major Component/Elements: 
 * - Input for game codes and player names
 * - Logic for users submitting users who are requesting to join a game
 * 
 * To-do:
 * - Convert angularfire code to firebase/firebaseobservables
 * - Test validate code
 * 
 */
@Component({
  templateUrl: './gamecode.component.html',
  styleUrls: ['gamecode.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class GameCodeComponent implements OnInit, AfterViewInit {
  userInfo: FormGroup;
  gameCode: string;
  playerName: string;
  textModalTitle: string;
  protected joinStatusSubscription: Subscription;
  protected failedJoin: boolean;
  protected joinGameRequestsRef: firebase.database.ThenableReference;

  constructor(
    protected formBuilder: FormBuilder,
    protected modals: NgbdModalService,
    protected gameSession: GameSessionService,
    protected router: Router,
  ) { }
  //protected modalService: NgbModal,
  //@ViewChild('textModal') protected textModalTemplateRef: TemplateRef<any>) { }

  ngOnInit() {

    // Loader
    $('.loader-img').fadeIn();
    $('.loader').delay(500).fadeIn('slow');

    // Setup the Form Control
    this.userInfo = this.formBuilder.group(
      {
        gameCode: [''],
        playerName: ['', Validators.required]
      }
    );

    if (this.gameSession.isHosting) {
      let gameCodeControl = this.userInfo.controls['gameCode'];
      gameCodeControl.setValue(this.gameSession.gameCode);
      gameCodeControl.disable();
    }

  }

  /**
   * If necessary....
   * Note:
   * https://www.dev6.com/Modal_Templates_in_Angular2_Part_1
   */
  ngAfterViewInit() {
  }

  submitForm() {

    if (this.userInfo.valid) {

      if (this.gameSession.isHosting) {
        this.updateUsername();
        this.router.navigateByUrl('#/lobby');
      } else {
        this.joinGame();
      }
    }

  }

  protected updateUsername() {

    this.gameSession.playerName = this.playerName;

    this.gameSession.userRef.child('game').update({ 'playerName': this.playerName });

  }

  joinGame() {
    this.submitJoinGameRequest();
    // maybe disable the join game request button
  }

  protected async submitJoinGameRequest() {

    this.joinGameRequestsRef =
      await firebase.database().ref(NodePaths.JOIN_GAME_REQUESTS).push();

    this.attachJoinRequestStatusSubscription(this.joinGameRequestsRef);

    let joinGameRequest: IJoinGameRequest = {
      user: this.gameSession.userId,
      id: this.joinGameRequestsRef.key,
      gameCode: this.gameCode,
      status: JoinRequestStatus.submitted
    };

    this.joinGameRequestsRef.set(joinGameRequest);
  }

  protected attachJoinRequestStatusSubscription(
    joinRequestRef: firebase.database.ThenableReference) {

    let options = new SubscribeOptions(
      joinRequestRef.child('status'),
      EventTypes.VALUE);

    options.existsOnly = true;

    let rxFb = new FirebaseObservable(
      this.gameSession.firebaseApp, options);

    this.joinStatusSubscription =
      rxFb.getObservable().subscribe(this.myStatusSubCallback);

  }

  protected myStatusSubCallback = (status: JoinRequestStatus) => {

    switch (status) {
      case JoinRequestStatus.submitted: // No change
        break;

      case JoinRequestStatus.approved:
        this.acknowledgeRequestResponse();
        this.updateUsername();

        this.gameSession.userRef.child('game').once(
          'value',
          snap => this.updateGameInfo);

        this.router.navigateByUrl('#/lobby');
        break;

      case JoinRequestStatus.denied:
        this.acknowledgeRequestResponse();
      // display Request Denied Error
      // maybe re-enable the join game request button

      default:
        this.acknowledgeRequestResponse();
        // display unexpected response error

        break;
    }

  }

  protected acknowledgeRequestResponse() {

    this.joinStatusSubscription.unsubscribe();
    this.joinGameRequestsRef.update({ 'status': JoinRequestStatus.acknowledged });
    this.joinStatusSubscription = null;
    this.joinGameRequestsRef = null;

  }

  protected updateGameInfo = (snapshot: firebase.database.DataSnapshot) => {
    let game: UserGame = snapshot.val();
    this.gameSession.gameCode = game.gameCode;
    this.gameSession.gameId = game.gameId;
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