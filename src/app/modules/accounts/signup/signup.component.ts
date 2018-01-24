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

// App Imports
import {
    FirebaseAuthService,
    AuthProviders, AuthServiceOptions, ROUTINGTREE
} from '../../../shared';
import { DisplayNameValidatorService } from '../services';
import {
    EmailValidator,
    PasswordValidator,
    FormErrorManager,
    ViewPortManagementService,
    LoggingService,
    NgModalService
} from '../../../shared';


@Component({
    templateUrl: 'signup.component.html',
    styleUrls: ['signup.component.css'],
    providers: [FormErrorManager, DisplayNameValidatorService]
})
export class SignUpComponent implements OnInit {

    signUpForm: FormGroup;

    public formErrors = {
        'email': '',
        'password': '',
        'displayName': ''
    };

    constructor(
        public authService: FirebaseAuthService,
        protected ngModalService: NgModalService,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected viewportManager: ViewPortManagementService,
        protected displayNameValidator: DisplayNameValidatorService,
        protected logger: LoggingService, ) {
    }

    ngOnInit() {
        this.setupSignUpForm();
    }

    createAccount = () => {

        this.logger.log('attempting to signup for new account...');

        if (this.signUpForm.pending) {
            this.signUpForm.statusChanges
                .take(1).subscribe(val => {
                    if (this.signUpForm.valid) {
                        this.submitNewAccount();
                    } else {
                        this.logger.log('Cannot submit new account\
                         request. Form status: ' + val);
                        this.logger.error(this.formErrors);
                    }
                });
            return;
        } else if (this.signUpForm.valid) {
            this.submitNewAccount();
            return;
        }

        this.logger.log('Cannot submit new account\
        request. Form status: ' + this.signUpForm.status);
    }

    protected setupSignUpForm() {

        this.signUpForm = this.formBuilder.group({
            'displayName': ['',
                [Validators.required],
                // This is applied here so that the FormBuilder
                // knows this is an async validator
                [this.displayNameValidator.validateDisplayName]
            ],
            'email': ['',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(36),
                    EmailValidator.validateEmail
                ],
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
        let controlNames = ['email', 'password', 'displayName'];

        let validationMessages = new Map<string, Map<string, string>>();

        let emailErrors = new Map<string, string>([
            ['required', '*Email is required'],
            ['minlength', '*Email must be at least 6 characters long'],
            ['maxlength', '*Email cannot be more than 36 characters long'],
            ['validateEmail', '*Invalid email format'],
            ['emailalreadyinuse', '*Email address already in use']
        ]);
        validationMessages.set('email', emailErrors);

        let passwordErrors = new Map<string, string>([
            ['required', '*Password is required.'],
            ['minlength', '*Password must be at least 6 characters long'],
            ['maxlength', '*Password cannot be more than 36 characters long'],
            ['haslowercase', '*Your Password must include lower-case characters'],
            ['hasuppercase', '*Your Password must include upper-case characters']
        ]);
        validationMessages.set('password', passwordErrors);

        let displayNameErrors = new Map<string, string>([
            ['required', '*Name is required'],
            ['invalid', '*Username not available']
        ]);
        validationMessages.set('displayName', displayNameErrors);

        this.errorManager.initErrorManager(
            this.signUpForm, controlNames, validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('email').subscribe(err => {
            this.formErrors.email = err;
        });
        this.errorManager.formErrors.get('password').subscribe(err => {
            this.formErrors.password = err;
        });
        this.errorManager.formErrors.get('displayName').subscribe(err => {
            this.formErrors.displayName = err;
        });
    }


    protected submitNewAccount() {

        let emailAuthOptions = {
            email: this.signUpForm.controls['email'].value,
            password: this.signUpForm.controls['password'].value,
            newAccount: true
        };

        this.logger.log('creating account...');

        let authOptions: AuthServiceOptions = {
            provider: AuthProviders.EMAIL,
            emailAuth: emailAuthOptions
        };

        let authObservable: Observable<firebase.User> =
            this.authService.login(authOptions);

        // finally subscribe to login
        authObservable
            .take(1).subscribe(
            user => {

                // update the users displayName
                let profileInfo = {
                    displayName: this.signUpForm.controls['displayName'].value,
                    photoURL: ''
                };
                user.updateProfile(profileInfo)
                    .then(
                    () => {
                        user.sendEmailVerification();
                        this.router.navigate([ROUTINGTREE.profile]);
                    });
            },
            err => {
                this.logger.log(err);
                let code = err.code;

                if (code === 'auth/email-already-in-use') {
                    let modal = this.ngModalService.error(
                        'An account with this email already exists! Try again.',
                        false, 'Email already registered');
                }
            });

    }

}
