// Vendor Imports
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { 
    NgbActiveModal, NgbModalRef 
} from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

// App Imports
import {
    GameCodeValidator,
    PlayerNameValidator
} from '../validators';
import {
    NgModalComponentTemplate, Buttons,
    DialogOptions, NgModalService
} from '../../../shared/ngmodalservice';
import {
    LoggingService,
    FormErrorManager,
    ViewPortManagementService
} from '../../../shared';


export interface GameCodeModalResult {
    gamecode: string;
    playerName: string;
}

@Component({
    selector: 'gamecode-modal-content',
    templateUrl: 'gamecode.modal.html',
    styleUrls: ['gamecode.modal.css'],
    providers: [FormErrorManager, GameCodeValidator, PlayerNameValidator],
    changeDetection: ChangeDetectionStrategy.OnPush, // <- some stackoverflow shit
    encapsulation: ViewEncapsulation.Emulated
})
export class GameCodeModalComponent extends NgModalComponentTemplate implements OnInit {

    static show(
        title: string,
        modalService: NgModalService,
        gameCode?: string): NgbModalRef {

        let buttons: Array<Buttons> = [
            Buttons.crossClose
        ];

        let options: DialogOptions = new DialogOptions(title, buttons);

        let ref = modalService.show(GameCodeModalComponent, options);

        if (gameCode) {
            let compt = ref.componentInstance as GameCodeModalComponent;
            compt.setGameCode(gameCode);
        }

        return ref;
    }

    protected gameCode: string;
    protected playerName: string;
    protected isHostingGame: boolean;
    protected gameCodeForm: FormGroup;
    protected validGameId: Subject<string>;

    formErrors = {
        'gamecode': '',
        'playerName': ''
    };


    constructor(
        public activeModal: NgbActiveModal,
        public changeRef: ChangeDetectorRef,
        protected formBuilder: FormBuilder,
        protected viewportManager: ViewPortManagementService,
        protected errorManager: FormErrorManager,
        protected gameCodeValidator: GameCodeValidator,
        protected playerNameValidator: PlayerNameValidator,
        protected logger: LoggingService) {
        super(activeModal, changeRef);
        this.validGameId = new Subject<string>();
        gameCodeValidator.setGameIdRxjs(this.validGameId);
        playerNameValidator.setGameIdRxjs(this.validGameId.asObservable());
    }

    ngOnInit() {
        this.setupGameCodeForm();
    }

    ngAfterViewInit() {
        if (this.gameCode) {
            this.gameCodeForm.controls.gamecode.setValue(this.gameCode);
            this.gameCodeForm.controls.gamecode.disable();
        }
    }

    protected setupGameCodeForm() {
        this.gameCodeForm = this.formBuilder.group({

            'gamecode': ['',
                [
                    Validators.minLength(5),
                    Validators.maxLength(5),
                    Validators.required
                ],
                // This is applied here so that the FormBuilder
                // knows this is an async validator
                [this.gameCodeValidator.validateGameCode]
            ],

            'playerName': ['',
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(18)
                ],
                // This is applied here so that the FormBuilder
                // knows this is an async validator
                [this.playerNameValidator.validatePlayerName]
            ]

        });

        this.initFormErrorManagement();
    }

    protected initFormErrorManagement() {
        let controlNames = ['gamecode', 'playerName'];

        let validationMessages = new Map<string, Map<string, string>>();

        let gameCodeErrors = new Map<string, string>([
            ['required', '*GameCode is required'],
            ['minlength', '*GameCode must be 5 characters long'],
            ['maxlength', '*GameCode must be 5 characters long'],
            ['validGameCode', '*Invalid Game Code'],
        ]);
        validationMessages.set('gamecode', gameCodeErrors);

        let playerNameErrors = new Map<string, string>([
            ['required', '*Player name is required.'],
            ['minlength', '*Player name must be at least 2 characters long'],
            ['maxlength', '*Player name cannot be more than 18 characters long'],
            ['validPlayerName', '*Player name already in use'],
        ]);
        validationMessages.set('playerName', playerNameErrors);

        this.errorManager.initErrorManager(
            this.gameCodeForm, controlNames, validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('gamecode').subscribe(err => {
            this.formErrors.gamecode = err;
        });
        this.errorManager.formErrors.get('playerName').subscribe(err => {
            //this.logger.log('player name is invalid: ');
            //this.logger.object(err);
            this.formErrors.playerName = err;
            this.changeRef.detectChanges();
            //this.logger.error(this.formErrors);
        });
    }

    disableGameCodeInput() {
        if (this.isHostingGame) {
            return true;
        } else {
            return false;
        }
    }

    buttonMsg(): string {
        return this.isHostingGame ? 'Start Game' : 'Join Game';
    }

    setGameCode(gamecode: string) {
        this.isHostingGame = true;
        this.gameCode = gamecode;
    }

    cancel() {
        this.activeModal.dismiss();
    }

    submitRequest() {

        this.logger.log('attempting to submiting ' + this.buttonMsg() + 'request');

        if (this.gameCodeForm.pending) {
            this.gameCodeForm.statusChanges.take(1)
                .subscribe(
                val => {
                    if (this.gameCodeForm.valid) {
                        this.closeToSubmit();
                    } else {
                        this.logger.log('Cannot submit ' +
                            this.buttonMsg() + 'request \
                        request. Form status: ' + val);
                        this.logger.error(this.formErrors);
                    }
                });
        } else if (this.gameCodeForm.valid) {
            this.closeToSubmit();
            return;
        }
    }

    protected closeToSubmit() {
        let myResult: GameCodeModalResult = {
            gamecode: this.gameCodeForm.controls.gamecode.value,
            playerName: this.gameCodeForm.controls.playerName.value
        };

        this.activeModal.close(myResult);
    }



}
