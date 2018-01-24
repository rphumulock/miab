// Vendor Imports
import {
    Component,
    OnInit
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';


// App Imports
import { NodePaths, Frame } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { UserSessionService, GameSessionService } from '../../../session';
import { FirebaseProjectService } from '../../../../core/firebaseutils';
import {
    DialogOptions,
    Buttons,
    NgModalComponentTemplate,
    NgModalService
} from '../../../../shared/ngmodalservice';
import { LoggingService } from '../../../../shared';


@Component({
    templateUrl: 'text.component.html',
    styleUrls: ['text.component.css']
})
export class TestTextFrameComponent {

    userGuessForm: FormGroup;
    showImgFrame: boolean;
    imgFrameUrl: string;
    mainMessage: string

    constructor(
        protected modalService: NgModalService,
        protected formBuilder: FormBuilder,
        protected logger: LoggingService) {
            this.mainMessage = 'Write Your Secret!';
    }

    ngOnInit() {
        this.setupFormGroup();
        this.imgFrameUrl = '/img/heyarnold.jpg';
        // Enable showImgFrame to show the box where the previous image is supposed to be
        this.showImgFrame = true;
    }

    displayGuess() {

        let options: DialogOptions;
        let buttons: Buttons[] = [Buttons.crossClose];
        let message = 'isValid Entry: ' + this.userGuessForm.valid +
            '\nYour guess: ' + this.userGuessForm.controls['guess'].value;

        options = new DialogOptions('Your guess...', buttons, message);

        this.modalService.show(NgModalComponentTemplate, options);

    }

    protected async setupFormGroup() {
        this.userGuessForm = this.formBuilder.group({
            'guess': ['',
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(240)
                ],
            ]
        });

        this.userGuessForm.valueChanges
            .subscribe(data => this.onUserGuessAuthFormValueChanged(data));

        this.onUserGuessAuthFormValueChanged();
    }

    protected formErrors = {
        'guess': ''
    };

    protected validationMessages = {
        'guess': {
            'required': '*Guess is required',
            'minlength': '*Guess must be at least 2 characters long',
            'maxlength': '*Guess cannot be more than 240 characters long'
        }
    };

    protected onUserGuessAuthFormValueChanged(data?: any) {
        const form = this.userGuessForm;
        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    /*
    protected processGameTurn() {
        if (this.details.previousFrame) {

            this.mainMessage = 'Your Turn to Guess!';
            
            let isEven = (this.details.currentTurn % 2) === 0;
            let options: DialogOptions;
            let buttons: Buttons[] = [Buttons.crossClose];

            if (isEven) {
                options = new DialogOptions('Previous Turn...', buttons, this.details.previousFrame.val);
            } else {
                options = new DialogOptions('Previous Turn...', buttons);
                options.imgSrcUrl = this.details.previousFrame.val;
            }


            this.modalRef = this.modalService.show(NgModalComponentTemplate, options);

            setTimeout(this.closeModal, 10000);
        }
    }*/


}



