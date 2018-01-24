// Vendor Imports
import {
    Component,
    OnInit,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {
    ActivatedRoute
} from '@angular/router';

// App Imports
import {
    EmailValidator,
    PasswordValidator,
    FormErrorManager,
    LoggingService,
    ViewPortManagementService,
    AuthProviders,
    AuthServiceOptions,
    EmailAuthOptions
} from '../../../shared';
import {
    SessionEventsBroker,
    AuthTypeEnum,
    UserSessionManager,
} from '../../session';


@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css'],
    providers: [FormErrorManager]
})
export class LoginComponent implements OnInit {

    emailAuthForm: FormGroup;
    emailAuthOpts: EmailAuthOptions;
    redirect: string;

    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'email': '',
        'password': ''
    };

    constructor(
        protected eventsBroker: SessionEventsBroker,
        protected route: ActivatedRoute,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected viewportManager: ViewPortManagementService,
        protected userSession: UserSessionManager,
        protected logger: LoggingService) {
    }

    ngOnInit() {
        this.setupAuthFormGroups();

        // if a custom redirect was requested, 
        // usually by user session guard
        this.route.paramMap.subscribe(
            params => {
                this.redirect = params.get('redir');
                if ( this.redirect ) {
                    this.redirect = decodeURI(this.redirect);
                }
            });
    }

    invalidate() {
        return { invalid: true };
    }

    /**
     * This is used on input labels 'click' events to ensure
     * that the input label text loses focus and gives 
     * it to the proper input element
     * @param id id of input element - must be unique on page
     */
    select(id: string) {
        let elem = document.getElementById(id);
        elem.focus();
        elem.click();
    }

    loginWithEmail = () => {
        this.logger.log('attempting email login...');

        if (!this.emailAuthForm.valid) {
            this.logger.log('invalid form... fix errors');
            return;
        }

        let emailOptions: EmailAuthOptions = {
            email: this.emailAuthForm.controls['email'].value,
            password: this.emailAuthForm.controls['password'].value,
            newAccount: false
        };

        let authOptions: AuthServiceOptions = {
            provider: AuthProviders.EMAIL,
            emailAuth: emailOptions
        };

        this.eventsBroker.newevent_authserviceevent({
            type: AuthTypeEnum.login,
            args: authOptions,
            redirect: this.redirect
        });
    }

    protected loginAnonymous = (authOptions: AuthServiceOptions) => {
        this.eventsBroker.newevent_authserviceevent({
            type: AuthTypeEnum.anonymous,
            redirect: this.redirect
        });
    }

    protected async setupAuthFormGroups() {
        this.emailAuthForm = this.formBuilder.group({
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
        let controlNames = ['email', 'password'];

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

        let passwordErrors = new Map<string, string>([
            ['required', '*Password is required.'],
            ['minlength', '*Password must be at least 6 characters long'],
            ['maxlength', '*Password cannot be more than 36 characters long'],
            ['haslowercase', '*Your Password must include lower-case characters'],
            ['hasuppercase', '*Your Password must include upper-case characters']
        ]);
        this.validationMessages.set('password', passwordErrors);

        this.errorManager.initErrorManager(
            this.emailAuthForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('email').subscribe(err => {
            this.logger.log('email input error received: ' + err);
            this.formErrors.email = err;
        });
        this.errorManager.formErrors.get('password').subscribe(err => {
            this.logger.log('password input error received: ' + err);
            this.formErrors.password = err;
        });
    }


}

