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
    providers: [FormErrorManager]
})
export class SignUpComponent implements OnInit {

    signUpForm: FormGroup;

    public formErrors = {
        'email': '',
        'password': '',
        'displayName': ''
    };

    constructor(
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected viewportManager: ViewPortManagementService,
        protected logger: LoggingService, ) {
    }

    ngOnInit() {
        this.setupSignUpForm();
    }

    createAccount = () => {
        this.logger.log('test signup request received');
    }

    protected setupSignUpForm() {

        this.signUpForm = this.formBuilder.group({
            'displayName': ['',
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(7)

                ]
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
            ['required', '*Username is required'],
            ['minlength', '*Username must be at least 6 characters long'],
            ['maxlength', '*Username cannot be more than 7 characters long'],   
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

        this.logger.log('test submit account request recceived');

    }

}
