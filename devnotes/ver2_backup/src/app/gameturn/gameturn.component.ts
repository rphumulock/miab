// Vendor Imports
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { GameSessionService} from '../services/gamesession.service';
import { NgbdModalService } from '../services/ngbdmodal.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import * as firebase from 'firebase';

// App Imports
import {
  NodePaths,
  GameState,
  GameTurnDetails,
  UserGame
} from 'miablib/miab';
import { concatPath } from 'miablib/global';

/**
 * Purpose: 
 * Provides a base class implementation of the logic necessary to determine:
 * 
 * - the current scoll type
 * - whether the game is actually complete
 * - whther this is the first frame or a normal frame
 * - whether or not to display the previous frame and the actual implementation of displaying the previous frame
 * - also monitors if the current turn is now over (as in time has runout)
 * - also provides the logic to rotate/determine the next scroll
 * - the logic to monitor for errors and send user back to the landing page
 * 
 * Major Component/Elements: 
 * 
 * 
 * To-do:
 * - convert from angularfire
 * - test/validate blow the fuck up and rebuild
 */
@Component({
  selector: 'gameturn'
})
export class GameTurnComponent implements OnInit {

  textModalTitle: string;
  textModalText: string;
  imgModalTitle: string;
  imgModalUrl: string;

  protected myScrollId: string;
  protected gameId: string;
  protected initGameTurnDetails: GameTurnDetails;
  protected postTurnFrameDetails: GameTurnDetails;
  protected currentTurnSubscription: Subscription;
  protected gameStateSubscription: Subscription;
  protected pendingSubmission: boolean;

  constructor(
    protected router: Router,
    protected gameSession: GameSessionService,
    protected modalService: NgbModalService,
    protected formBuilder: FormBuilder,
    @ViewChild('textModal') protected textModalTemplateRef: TemplateRef<any>,
    @ViewChild('imgModal') protected imgModalTemplateRef: TemplateRef<any>) { };


  submitForm() {

    if (this.pendingSubmission) {
      this.submitFrame();
      this.pendingSubmission = false;
      //this.displayWaitingForNextTurn();
    }

  }

  ngOnInit() {

    this.pendingSubmission = true;

    let myScrollIdRef: firebase.database.Reference = this.af.database.object(
      this.gameSession.userRef.child('game')
    ).$ref;

    myScrollIdRef.once('value', snap => {
      let game: UserGame = snap.val();
      this.gameId = game.gameId;
      this.myScrollId = game.myScrollId;
      this.loadScrollAndLastFrame().then(val => this.initGameTurnDetails
   = val);
    });

    this.currentTurnSubscription = this.af.database.object(
      this.gameSession.gameRef.child('currentFrame'),
      { preserveSnapshot: true }
    ).subscribe(this.monitorCurrentFrameTimer);

    this.gameStateSubscription = this.af.database.object(
      this.gameSession.gameRef.child('gameState'),
      { preserveSnapshot: true }
    ).subscribe(this.monitorGameState);

  }

  async loadScrollAndLastFrame(): Promise<GameTurnDetails> {

    let frameDetails: GameTurnDetails = new GameTurnDetails();

    let currentTurnRef: firebase.database.Reference = this.af.database.object(
      this.gameSession.gameRef.child('currentFrame')
    ).$ref;

    await currentTurnRef.once('value', snap => { frameDetails.currentGameTurn = snap.val(); });

    //if (!frameDetails.currentGameTurn) { this.displayError(); return; }

    let assignedScrollRef: firebase.database.Reference = this.af.database.object(
      this.gameSession.userRef.child('game/currentScroll')).$ref;

    await assignedScrollRef.once('value', snap => { frameDetails.assignedScroll = snap.val(); });

    if (!frameDetails.assignedScroll) { 
      //this.displayError(); 
      return; }

    if (frameDetails.assignedScroll.id == this.myScrollId) {
      frameDetails.showPrevious = false;
      if (frameDetails.currentGameTurn != 0) { 
        frameDetails.isCompletedGame = true; }
      return;
    }

    let lastFramePlayedQuery: firebase.database.Query = this.af.database.list(
      concatPath([NodePaths.SCROLLS, frameDetails.assignedScroll.id, 'frames']),
      {
        query: {
          orderByKey: true,
          limitToLast: 1
        }
      }
    ).$ref;

    await lastFramePlayedQuery.once('value', snap => {
      frameDetails.previousFrame = snap.val();
    });

    if (!frameDetails.previousFrame) {
      //this.displayError();
    } else {
      frameDetails.showPrevious = true;
    }

    return Promise.resolve(frameDetails);
  }

  protected monitorCurrentFrameTimer = (snapshot: firebase.database.DataSnapshot) => {

    let listedGameTurn: number = snapshot.val();

    if (listedGameTurn != this.initGameTurnDetails.currentGameTurn) {

      if (this.pendingSubmission) {
        this.submitFrame();
        this.pendingSubmission = false;
        //this.displayWaitingForNextTurn();
      }

      this.rotateToNextTurn();

    }
  }

  protected monitorGameState = (snapshot: firebase.database.DataSnapshot) => {

    let state: GameState = snapshot.val();

    if (state == GameState.err) {
      //this.displayError();
    }

    if (state == GameState.complete) {
      this.navigateToCompletedGame();
    }
  }

  protected rotateToNextTurn = async () => {

    await this.loadScrollAndLastFrame().then(val => this.postTurnFrameDetails = val);

    if (this.postTurnFrameDetails.isCompletedGame) {
      this.navigateToCompletedGame();
    } else {
      if (this.initGameTurnDetails.currentGameTurn % 2 == 0) {
        this.router.navigateByUrl('#/drawingframe');
      } else {
        this.router.navigateByUrl('#/textframe');
      }
    }

  }

  /**
   * This needs to be overriden
   */
  protected submitFrame = () => {
    //this.displayError('Critical - Override the "submitFrame" method! ');
  };

  protected displayWaitingForNextTurn() {


    this.textModalText = this.postTurnFrameDetails.previousFrame.val;
    this.textModalTitle = 'Waiting Next Turn...';

    // Hide the close button
    $("button[id='textModalClose']").prop('disabled', true);
    $("button[id='textModalClose']").prop('hidden', true);

    let waitingTextModal =
      this.modalService.open(this.textModalTemplateRef,
        {
          size: 'lg',
          backdrop: 'static',
          keyboard: false
        });
  }

  protected displayPreviousTextFrame() {

    this.textModalText = this.postTurnFrameDetails.previousFrame.val;
    this.textModalTitle = 'Previous Turn...';
    let previousTextModal =
      this.modalService.open(this.textModalTemplateRef, { size: 'lg' });

    setTimeout(() => previousTextModal.close(), 10000);

  }

  protected displayPreviousImgFrame() {
    this.imgModalUrl = this.postTurnFrameDetails.previousFrame.val;
    this.imgModalTitle = 'Previous Turn...';
    let previousImgModal =
      this.modalService.open(this.textModalTemplateRef, { size: 'lg' });

    setTimeout(() => previousImgModal.close(), 15000);
  }

  protected displayError(msg?: string) {
    if (!msg) {
      this.textModalText =
        'Sorry, there was an error with the game&hellip; Please try again.';
    }

    this.textModalTitle = 'Sorry... :('
    let result = this.modalService.open(this.textModalTemplateRef).result;
    result.then(this.backToLanding);
  }

  protected backToLanding = () => {
    this.af.auth.logout();
    this.router.navigateByUrl('#/landing');
  }

  protected navigateToCompletedGame() {
    this.router.navigateByUrl('#/userchest');
  }

}