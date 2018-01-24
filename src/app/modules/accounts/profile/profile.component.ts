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
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import * as $ from 'jquery';


// App Imports
import {
    LoggingService,
    NgModalService,
    NgModalComponentTemplate,
    DialogOptions,
    Buttons,
    FormErrorManager,
    ViewPortManagementService
} from '../../../shared';
import {
    AuthTypeEnum,
} from '../../session/event-types';
import {
    SessionEventsBroker,
} from '../../session/services';
import {
    UserSessionManager,
} from '../../session/managers';
import {
    UserProfileService
} from '../../session/requestservices';
import {
    LinkGuestAccountService,
    PermlinkValidationService
} from '../services';


/**
 * To-do:
 * Styling 
 * Error Alerting... example: https://scotch.io/tutorials/angular-2-form-validation
 * Show Proper Elements when appropriate:
 *      - Show displayname field when user is signing up
 */
@Component({
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.css'],
    providers: [FormErrorManager]
})
export class UserProfileComponent implements OnInit {

    guestAccountForm: FormGroup;

    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'permlink': ''
    };

    loggedInUser: string;
    linkAccountMessage: string;
    gameCode: string;

    constructor(
        protected eventsBroker: SessionEventsBroker,
        protected userSession: UserSessionManager,
        protected ngModalService: NgModalService,
        protected linkGuestAcctService: LinkGuestAccountService,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected permlinkValidator: PermlinkValidationService,
        protected profileDetails: UserProfileService,
        protected router: Router,
        protected viewportManager: ViewPortManagementService,
        protected logger: LoggingService) {
    }

    ngOnInit() {

        this.setupPermlinkFormGroups();

        this.getProfileDetails();

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
        this.eventsBroker.newevent_authserviceevent({
            type: AuthTypeEnum.logout,
        });
    }

    linkGuestAccountGames() {

        this.logger.log('attempting to link guest account...');

        if (this.guestAccountForm.pending) {

            this.guestAccountForm.statusChanges
                .take(1).subscribe(val => {
                    if (this.guestAccountForm.valid) {
                        this.requestLinkGuestAcct();
                    } else {
                        this.logger.log('Cannot submit new account\
                     request. Form status: ' + val);
                        this.logger.error(this.formErrors);
                    }
                });

            return;

        } else if (this.guestAccountForm.valid) {
            this.requestLinkGuestAcct();
            return;
        }

    }

    protected requestLinkGuestAcct() {

        // the permlink code is provided to the 
        // linkguestaccount service via the validator
        if (this.linkGuestAcctService.canLinkGuestAccount()) {
            this.linkGuestAcctService.linkGuestAccount()
                .subscribe(
                result => {
                    if (!result) {
                        this.ngModalService.error(
                            'Sorry :(, we can\'t seem to link your games',
                            false, 'Oh no... :(')
                    } else {
                        let msg = 'Your guest account games have been successfully \
                    linked to your account!';

                        let buttons: Array<Buttons> = [Buttons.crossClose];

                        let options = new DialogOptions('Success!', buttons, msg);

                        this.ngModalService.show(NgModalComponentTemplate, options);
                    }
                });
        }

    }

    protected async setupPermlinkFormGroups() {
        this.guestAccountForm = this.formBuilder.group({
            'permlink': ['',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(36),
                ],
                // Async Validators
                [this.permlinkValidator.validatePermlink]
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
            ['validatePermlink', '*Invalid guest account permlink code']
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

    protected getProfileDetails() {

        this.profileDetails.getMiabUser()
            .then(
            user => {

                let test = 1;

                while (test < 4) {

                    switch (test) {
                        case 1:
                            if (!user || this.userSession.isAnonymous) {
                                this.loggedInUser = 'Guest';
                                test++; // skip test 2
                            }
                            break;
                        case 2:
                            this.loggedInUser = user.displayName;
                            break;
                        case 3:
                            if (user && user.gameCode) {
                                this.gameCode = user.gameCode;
                            }
                            break;
                    }

                    test++; // always increment
                }

            })
            .catch(
            err => {
                this.logger.error('Unable to retrieve user profile details!');
                this.logger.error(err);
            });
    }

}
