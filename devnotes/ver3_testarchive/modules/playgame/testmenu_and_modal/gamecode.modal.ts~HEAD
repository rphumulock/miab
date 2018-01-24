// Vendor Imports
import {
    Component,
    Input,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import {
    FormControl,
    FormGroupDirective,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    NgModalComponentTemplate, Buttons,
    DialogOptions, NgModalService
} from '../../../shared/ngmodalservice';
import { LoggingService, ViewPortManagementService } from '../../../shared';

export interface GameCodeModalResult {
    gamecode: string;
    playerName: string;
}

@Component({
    selector: 'gamecode-modal-content',
    templateUrl: 'gamecode.modal.html',
    styleUrls: ['gamecode.modal.css'],
    changeDetection: ChangeDetectionStrategy.OnPush, // <- some stackoverflow shit
    encapsulation: ViewEncapsulation.Emulated
})
export class GameCodeModalTestComponent extends NgModalComponentTemplate implements OnInit {

    gameCode: string;
    playerName: string;
    disableGameCode: boolean;
    gameCodeForm: FormGroup;

    static show(
        title: string,
        modalService: NgModalService,
        gameCode?: string): NgbModalRef {

        let buttons: Array<Buttons> = [
            Buttons.crossClose,
            Buttons.submit
        ];

        let options: DialogOptions = new DialogOptions(title, buttons);

        let ref = modalService.show(GameCodeModalTestComponent, options);

        return ref;
    }

    constructor(
        public activeModal: NgbActiveModal,
        public changeRef: ChangeDetectorRef,
        protected formBuilder: FormBuilder,
        protected viewportManager: ViewPortManagementService,
        protected logger: LoggingService) {
        super(activeModal, changeRef);
        this.disableGameCode = false; // for testing 
    }

    ngOnInit() {
        this.gameCodeForm = this.formBuilder.group({

            'gamecode': ['',
                [
                    Validators.minLength(5),
                    Validators.maxLength(5),
                    Validators.required
                ]
            ],

            'playerName': ['',
                [
                    Validators.required,
                    Validators.minLength(2)
                ]
            ]

        });

        if ( this.disableGameCode ) {
            this.gameCodeForm.controls.gamecode.setValue(this.gameCode);
            this.gameCodeForm.controls.gamecode.disable();
        }        

    }

    buttonMsg(): string {
        return 'Start/Join Game';
    }

    submitRequest() {

        if (this.gameCodeForm.controls.playerName.valid) {

            let myResult: GameCodeModalResult = {
                gamecode: this.gameCodeForm.controls.gamecode.value,
                playerName: this.gameCodeForm.controls.playerName.value
            };

            this.logger.log('closing test gamecode ngmodal component...');
            this.logger.log('isValid: ' + this.gameCodeForm.valid);
            this.logger.object(myResult);
            
            this.activeModal.close(myResult);
        } else {

            for (let field in this.gameCodeForm.controls) {
                let control = this.gameCodeForm.controls[field];
                this.logger.log(field + 'isValid: ' + control.valid);
                if (!control.valid) {
                    for (let error in control.errors) {
                        this.logger.warn(error + ': ' + JSON.stringify(control.errors[error]));
                    }
                }
            }
        }
    }

}
