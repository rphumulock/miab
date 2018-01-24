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
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    FirebaseProjectService, FirebaseAuthService
} from '../../../shared';
import { UserSessionManager } from '../../session';
import { PasswordValidator, FormErrorManager } from '../../../shared/';
import {
    LoggingService, NgModalService,
    NgModalComponentTemplate, DialogOptions,
    Buttons, ViewPortManagementService
} from '../../../shared';


/**
 * To-do:
 * Styling 
 * Error Alerting... example: https://scotch.io/tutorials/angular-2-form-validation
 * Show Proper Elements when appropriate:
 *      - Show displayname field when user is signing up
 */
@Component({
    templateUrl: 'finishreset.component.html',
    styleUrls: ['finishreset.component.css'],
    providers: [FormErrorManager]
})
export class PasswordResetComponent implements OnInit {

    passwordResetForm: FormGroup;

    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'resetcode': '',
        'password': ''
    };

    constructor(
        protected projectsMgr: FirebaseProjectService,
        public authService: FirebaseAuthService,
        protected userSession: UserSessionManager,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected ngModalService: NgModalService,
        protected viewportManager: ViewPortManagementService,
        protected logger: LoggingService) {
            this.logger.log('request password reset component instantiating');
    }

    ngOnInit() {
        this.setupAuthFormGroups();

    }


    invalidate() {
        return { invalid: true };
    }

    resetPassword = () => {

        if (!this.passwordResetForm.valid) {
            return;
        }

        this.authService.finalizePasswordReset(
            this.projectsMgr.default,
            this.passwordResetForm.controls['resetcode'].value,
            this.passwordResetForm.controls['password'].value)
            .catch(
            err => {
                this.logger.error(err);
                this.ngModalService.error('Unable to reset your password: ' + err);
                return Observable.throw(err);
            })
            .subscribe(
            () => {
                let options = new DialogOptions('Success!',
                    [Buttons.crossClose], 'You\'ve successfully updated your password!');

                let modal = this.ngModalService.show(NgModalComponentTemplate, options);

                modal.result
                    .then(
                    () => { this.router.navigate(['/accounts/login']) })
                    .catch(
                    () => { this.router.navigate(['/accounts/login']) })

                setTimeout(modal.close, 3000, modal);
            });

    }

    protected async setupAuthFormGroups() {
        this.passwordResetForm = this.formBuilder.group({
            'resetcode': ['',
                [
                    Validators.required,
                ]//, later add an async code validator prior to submission
                // [ this.resetCodeValidator.validateResetCode ]
            ],
            'password': ['',
                [
                    Validators.required,
                    PasswordValidator.weakPasswordStrength
                ]
            ]
        });

        this.initFormErrorManagement();

    }

    protected initFormErrorManagement() {
        let controlNames = ['resetcode', 'password'];

        this.validationMessages = new Map<string, Map<string, string>>();

        let resetCodeErrors = new Map<string, string>([
            ['required', '*Reset code is required'],
            //['validateResetCode', '*Password reset code is not valid'],
        ]);
        this.validationMessages.set('resetcode', resetCodeErrors);

        let passwordErrors = new Map<string, string>([
            ['required', '*Password is required.'],
            ['minlength', '*Password must be at least 6 characters long'],
            ['maxlength', '*Password cannot be more than 36 characters long'],
            ['haslowercase', '*Your Password must include lower-case characters'],
            ['hasuppercase', '*Your Password must include upper-case characters']
        ]);
        this.validationMessages.set('password', passwordErrors);

        this.errorManager.initErrorManager(
            this.passwordResetForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('resetcode').subscribe(err => {
            this.formErrors.resetcode = err;
        });
        this.errorManager.formErrors.get('password').subscribe(err => {
            this.formErrors.password = err;
        });
    }

}

