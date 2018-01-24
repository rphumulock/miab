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
import { FormErrorManager } from '../../../shared';

// App Imports
import {
    FirebaseProjectService, FirebaseAuthService
} from '../../../shared';
import { EmailValidator, ViewPortManagementService } from '../../../shared';
import { LoggingService, NgModalService } from '../../../shared';

@Component({
    templateUrl: 'requestreset.component.html',
    styleUrls: ['requestreset.component.css'],
    providers: [FormErrorManager]
})
export class PasswordResetRequestComponent implements OnInit {

    resetSent: boolean;
    resetPasswordForm: FormGroup;
    protected modalRef: NgbModalRef;
    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'email': ''
    };

    constructor(
        protected projectsMgr: FirebaseProjectService,
        public authService: FirebaseAuthService,
        protected ngModalService: NgModalService,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected logger: LoggingService,
        protected viewportManager: ViewPortManagementService) {
        this.logger.log('request password reset component instantiating');
        this.resetSent = false;
    }

    ngOnInit() {
        this.setupAuthFormGroups();
    }

    invalidate() {
        return { invalid: true };
    }

    requestResetEmail = () => {

        if (!this.resetPasswordForm.valid) { return }
        this.modalRef = this.ngModalService.waiting('Submitting request...', 'Please wait');

        this.authService.sendPwResetEmail(
            this.projectsMgr.default,
            this.resetPasswordForm.controls['email'].value)
            .catch(
            err => {
                this.closeModal();
                this.modalRef =
                    this.ngModalService.error('Unable to send a reset email: ' + err);

                this.modalRef.result
                    .then(this.navToLogin)
                    .catch(this.navToLogin);

                return Observable.throw(err);
            })
            .subscribe(
            value => {
                this.closeModal();
                this.modalRef =
                    this.ngModalService.waiting('Successfully submitted password reset!', 'Password reset sent');
                this.resetSent = true;
                setTimeout(this.closeModal, 3500);
            });

    }

    protected navToLogin = () => {
        this.closeModal();
        this.router.navigate(['/accounts/login']);
    }

    protected closeModal() {
        if (this.modalRef) {
            this.modalRef.close();
            this.modalRef = null;
        }
    }

    protected async setupAuthFormGroups() {
        this.resetPasswordForm = this.formBuilder.group({
            'email': ['',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(36),
                    EmailValidator.validateEmail
                ],
            ]
        });

        this.initFormErrorManagement();
    }

    protected initFormErrorManagement() {
        let controlNames = ['email'];

        this.validationMessages = new Map<string, Map<string, string>>();

        let emailErrors = new Map<string, string>([
            ['required', '*Email is required'],
            ['minlength', '*Email must be at least 6 characters long'],
            ['maxlength', '*Email cannot be more than 36 characters long'],
            ['validateEmail', '*Invalid email format'],
            ['badlogin', '*Login failed. Invalid email or password'],
            ['unknownerror', '*Sorry, an unknown error occured. Try again']
        ]);
        this.validationMessages.set('email', emailErrors);

        this.errorManager.initErrorManager(
            this.resetPasswordForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('email').subscribe(err => {
            this.formErrors.email = err;
        });
    }


}

