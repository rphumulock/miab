// Vendor Imports
import {
    Component,
    OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';


// App Imports
import { NodePaths, Frame } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    UserSessionManager,
    GameSessionManager,
    SessionEventsBroker
} from '../../session';
import {
    GameLoopEventsBroker,
    GameLoopManager
} from '../services';
import {
    FormErrorManager, ViewPortManagementService,
    NgModalService, LoggingService,
    FirebaseProjectService
} from '../../../shared';
import { AbstractGameTurnComponent } from '../abstract.component';


@Component({
    templateUrl: 'text.component.html',
    styleUrls: ['text.component.css'],
    providers: [FormErrorManager]
})
export class TextFrameComponent extends AbstractGameTurnComponent {

    userGuessForm: FormGroup;

    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'guess': ''
    };

    protected userMessage = 'Enter Your Secret Message!';
    protected inputLabel = 'Enter your secret';

    constructor(
        // text frame specific
        protected formBuilder: FormBuilder,
        protected userSession: UserSessionManager,
        protected errorManager: FormErrorManager,
        // abstract class
        protected eventsBroker: GameLoopEventsBroker,
        protected globalEventsBroker: SessionEventsBroker,
        protected gameloopManager: GameLoopManager,
        protected gameSession: GameSessionManager,
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected viewportMgr: ViewPortManagementService,
        protected router: Router,
        protected logger: LoggingService) {
        // Invoke the abstract classes contructor - required with inheritance

        super(gameloopManager, gameSession, projectsMgr,
            modalService, globalEventsBroker, eventsBroker,
            viewportMgr, router, logger);

    }

    ngOnInit() {
        super.ngOnInit();
        this.setupFormGroup();
    }

    submitGuess() {
        if (!this.userGuessForm.valid) {
            this.submitFrame(true);
        }
    }

    protected processSubmitFrame(): Promise<any> {

        let toSubmit: Frame = new Frame(
            this.userSession.userId,
            this.gameSession.gameId,
            this.details.assignedScroll.scrollId,
            this.details.currentTurn,
            false,
            this.userGuessForm.controls['guess'].value
        );

        let promise: any = this.projectsMgr.default.db
            .ref(concatPath([NodePaths.FRAMES]))
            .push(toSubmit);//.then(() => Promise.resolve(true));

        return promise;

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

        this.initFormErrorManagement();
    }

    protected initFormErrorManagement() {
        let controlNames = ['guess'];

        this.validationMessages = new Map<string, Map<string, string>>();

        let guessErrors = new Map<string, string>([
            ['required', '*Guess is required'],
            ['minlength', '*Guess must be at least 2 characters long'],
            ['maxlength', '*Guess cannot be more than 240 characters long']
        ]);
        this.validationMessages.set('guess', guessErrors);

        this.errorManager.initErrorManager(
            this.userGuessForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('guess').subscribe(err => {
            this.logger.log('guess input error received: ' + err);
            this.formErrors.guess = err;
        });
    }

    protected processGameTurn() {
        if (this.details.previousFrame && this.details.previousFrame.val) {
            this.userMessage = 'Your Turn To Guess!';
            this.inputLabel = 'Enter your guess...';
        }

    }
}



