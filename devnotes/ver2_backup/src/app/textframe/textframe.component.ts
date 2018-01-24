// Vendor Imports
import {
    Component,
    AfterContentInit,
    ViewEncapsulation,
} from '@angular/core';

//import { } from 'angularfire2';
import { FormGroup, Validators } from '@angular/forms';
import { GameTurnComponent } from '../gameturn/gameturn.component';

// App Imports
import { Frame, FrameType, NodePaths } from 'miablib/miab';
import { concatPath } from 'miablib/global';

/**
 * Purpose: To implement the submit frame method for text frames
 * and to also provide the textarea/template for the text frames
 * 
 * Major Component/Elements: 
 * - input for the text frame
 * 
 * To-do:
 * - convert fom angularfire
 * - test/validate logic
 */
@Component({
    templateUrl: './textframe.component.html',
    styleUrls: ['textframe.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class TextFrameComponent extends GameTurnComponent implements AfterContentInit {

    userTextForm: FormGroup;
    message: string;

    ngOnInit() {
        super.ngOnInit();

        this.userTextForm = this.formBuilder.group({
            userText: ['', Validators.required]
        });
    }

    ngAfterContentInit() {

        if (this.initGameTurnDetails.showPrevious) {
            //this.displayPreviousImgFrame();
        }
    }

    submitFrame = () => {

        let toSubmit: Frame = new Frame();
        toSubmit.gameId = this.gameId;
        toSubmit.scrollId = this.initGameTurnDetails.assignedScroll.id;
        toSubmit.type = FrameType.text;
        toSubmit.user = this.gameSession.userId;
        toSubmit.val = this.message;

        let framesRef: firebase.database.Reference =
            this.af.database.list(NodePaths.FRAMES).$ref as firebase.database.Reference;

        let hold = true;
        framesRef.push(toSubmit, () => { hold = false; });

        while (hold) {
            // do nothing;
        }
    }

}