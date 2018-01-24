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
import * as firebase from 'firebase';
import * as $ from 'jquery';

// App Imports
import {
    LoggingService, NgModalService,
    FormErrorManager, ViewPortManagementService
} from '../../../shared';
import { PermlinkValidationService } from '../services';



/**
 * To-do:
 * Styling 
 * Error Alerting... example: https://scotch.io/tutorials/angular-2-form-validation
 * Show Proper Elements when appropriate:
 *      - Show displayname field when user is signing up
 */
@Component({
    templateUrl: 'test.component.html',
    styleUrls: ['test.component.css'],
    providers: [FormErrorManager]
})
export class UserProfileTestComponent implements OnInit {

    loggedIn: boolean;
    canUpgrade: boolean;
    loggedInUser: string;
    linkAccountMessage: string;
    gameCode: string;

    guestAccountForm: FormGroup;
    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'permlink': ''
    };

    constructor(
        protected ngModalService: NgModalService,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected permlinkValidator: PermlinkValidationService,
        protected viewportManager: ViewPortManagementService,
        protected logger: LoggingService) {
    }

    ngOnInit() {

        this.loggedInUser = 'Test User Account';
        this.setupPermlinkFormGroups();
        this.gameCode = '678OPS';

        // enable this to show the 'You are logged in as...' section
        // and the logout button. 
        this.loggedIn = true;


        // enable this to show the link/upgrade your account...
        this.canUpgrade = true;

        this.linkAccountMessage = 'Hey! If you want to save your games played under a\
        guest acount, enter your permlink below';

        this.viewportManager.change(false).subscribe(
            event => {
                let elems = [
                    document.getElementById('card-header'),
                    document.getElementById('card-footer')
                ]

                let update = event.delta == 1 ? false : true;

                elems.forEach(
                    elem => {
                        $(elem).prop('hidden', update);
                        $(elem).attr('hidden', update); // for IE
                    }
                );
            }
        )

    }

    logOut = () => {

        this.logger.log('Test logout button clicked...');
    }

    linkGuestAccountGames() {
        this.logger.log('Requesting guest account upgrade!!');
    }

    protected async setupPermlinkFormGroups() {
        this.guestAccountForm = this.formBuilder.group({
            'permlink': ['',
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(4),
                ]
            ]
        });

        this.initFormErrorManagement();
    }

    protected initFormErrorManagement() {
        let controlNames = ['permlink'];

        this.validationMessages = new Map<string, Map<string, string>>();

        let permlinkErrors = new Map<string, string>([
            ['required', '*Permlink code is required'],
            ['minlength', '*Permlink code must be at least 5 characters long'],
            ['maxlength', '*Permlink code cannot be more than 5 characters long'],
        ]);
        this.validationMessages.set('permlink', permlinkErrors);

        this.errorManager.initErrorManager(
            this.guestAccountForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('permlink').subscribe(err => {
            this.formErrors.permlink = err;
        });
    }

}

