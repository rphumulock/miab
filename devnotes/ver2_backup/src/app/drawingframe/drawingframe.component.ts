// Vendor Imports
import {
  Component,
  AfterContentInit,
  ViewEncapsulation,
} from '@angular/core';

// App Imports
import { Frame, NodePaths, FrameType } from 'miablib/miab';
import { GameTurnComponent } from '../gameturn/gameturn.component';
import { devAppConfig, productionAppConfig } from '../services/auth.config';
let blobGen = require('../js/dataUrlToBlob.js');
let DrawingBoard = require('./drawingboard.js');

/**
 * Purpose: 
 * Implement the submit frame method for drawing frames,
 * and to also host the logic for the drawingboard api and 
 * any other image based stuff (e.g. emojiis/zooming etc)
 * 
 * Mjaor Components:
 * - Drawingboard canvas
 * - submitFrame() method implementation
 * 
 * To-do:
 * - convert from angularfire
 * - test/validate logic
 * - add emojii support
 * - add zoom support 
 */
@Component({
  selector: 'drawingframe',
  styleUrls: ['./drawingboard.css', './drawingframe.component.css'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './drawingframe.component.html'
})
export class DrawingFrameComponent extends GameTurnComponent implements AfterContentInit {

  defaultBoard: any;

  ngAfterContentInit() {

    this.defaultBoard = new DrawingBoard.DrawingBoard.Board('default-board', {
      webStorage: false,
      enlargeYourContainer: true
    });

    if (this.initGameTurnDetails.showPrevious) {
      //this.displayPreviousTextFrame();
    }

  }

  submitFrame = () => {

    let toSubmit: Frame = new Frame();
    toSubmit.gameId = this.gameId;
    toSubmit.scrollId = this.initGameTurnDetails.assignedScroll.id;
    toSubmit.type = FrameType.image;
    toSubmit.user = this.gameSession.userId;
    toSubmit.onGameTurn = this.initGameTurnDetails.currentGameTurn;

    // https://github.com/Leimi/drawingboard.js/blob/master/js/board.js
    let imagDataUrl = this.defaultBoard.getImg();

    let submitPromise: Promise<boolean> = this.submitImageFrame(toSubmit, imagDataUrl);

    submitPromise.then(
      val => { this.pendingSubmission = false; }
    )

  }

  protected async submitImageFrame(
    frame: Frame, imgAsDataUrl: any): Promise<boolean> {


    let newFileName = 'img-' + this.gameSession.userId + '-'
      + firebase.database.ServerValue.TIMESTAMP + '.png';

    let fileLocRef = this.gameSession.storage.ref('userimages/' + newFileName);

    let fileBlob = blobGen.DataUrlToBlob();

    let fileUrl: string;

    // https://firebase.google.com/docs/reference/js/firebase.storage.UploadTaskSnapshot
    await fileLocRef.put(fileBlob).then(snap => { fileUrl = snap.downloadURL; });

    frame.val = fileUrl;

    let framesRef: firebase.database.Reference =
      this.af.database.list(NodePaths.FRAMES).$ref as firebase.database.Reference;

    framesRef.push(frame);

    return Promise.resolve(true);

  }

}



