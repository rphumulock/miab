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
import { Observable, Subject } from 'rxjs';
import * as firebase from 'firebase';

// App Imports
import {
    FirebaseProjectService,
    FirebaseAuthService,
    AuthProviders,
    AuthServiceOptions,
    EmailAuthOptions
} from './';
import { LoggingService, EmailValidator } from '../../shared/';

/**
 * Purpose: Use to test the ngmodalservice feature module
 * 
 * To use this, add it any of your modules import arrays and refernece it
 * in your templates however you want to...
 * 
 * e.g: add it to your routes
 * 
 * To-do:
 * 
 */
@Component({
    template:
    `
    <h4>AuthService Testing Component</h4>
    <button (click)="loginAnonymously()">Click Me To LogIn Anonymously</button>
    <button (click)="logOut()">Click Me To LogOut</button>
    <button (click)="checkCurrentUser()">Click Me To CheckUser</button>
    <br/><br/>
    <form class="form-inline" role="form" (ngSubmit)="loginWithEmail()" [formGroup]="emailAuthForm" novalidate>
        <div class="form-content">
            <label for="email">Sign up!</label>
            <input required id="email" formControlName="email" type="text" placeholder="Enter your email..." class="subscribe-email form-control">
            <br/>
            <label for="password">Password:</label>
            <input required id="password" formControlName="password" type="password" placeholder="...." class="form-control">
            <br/>
            <button class="btn btn-primary-outline" type="submit">Submit</button>
        </div>
    </form>
    `
})
export class AuthServiceTestComponent {
    emailAuthForm: FormGroup;

    newAccount: boolean;
    lastUserReturned: firebase.User;
    lastUsedProvider: AuthProviders;
    loggedIn: boolean;

    protected authResult: Subject<firebase.User>;

    constructor(
        protected authService: FirebaseAuthService,
        protected projectsMgr: FirebaseProjectService,
        protected formBuilder: FormBuilder,
        protected logger: LoggingService) {

        this.authResult = new Subject<firebase.User>();
    }

    ngOnInit() {
        // Setup the Form Control
        this.emailAuthForm = this.formBuilder.group(
            {
                'email': ['', [
                    Validators.required,
                    EmailValidator.validateEmail,
                    Validators.minLength(6),
                    Validators.maxLength(36)
                ],],
                'password': ['',]
            }
        );
    }

    checkCurrentUser = () => {

        this.logger.log('checking currently logged in user...');

        let authOptions: AuthServiceOptions = {
            provider: AuthProviders.ANONYMOUS // doesnt matter here
        }

        this.lastUsedProvider = undefined;
        let authObservable: Observable<firebase.User> =
            this.authService.checkCurrentUser(authOptions);

        // finally subscribe to login
        authObservable.subscribe(
            user => {
                this.printUserInfo(user);
            },
            err => {
                this.logger.log(err);
                this.authResult.next(null);
            }
        );
    }

    loginWithEmail = () => {

        this.logger.log('attempting email login...');
        // Read and reset immediately...
        let createAccount = this.newAccount;
        this.newAccount = false;

        if (!this.emailAuthForm.valid) {
            this.logger.log('invalid form... fix errors');
            return;
        }

        let emailAuthOpts: EmailAuthOptions = {
            email: this.emailAuthForm.controls['email'].value,
            password: this.emailAuthForm.controls['password'].value,
            newAccount: createAccount
        };

        let authOptions: AuthServiceOptions = {
            provider: AuthProviders.EMAIL,
            emailAuth: emailAuthOpts
        };

        let authObservable: Observable<firebase.User> = this.authService.login(authOptions);

        // finally subscribe to login
        /*
        authObservable.take(2).subscribe(
            user => { this.printUserInfo(user); },
            err => { this.logger.log(err); }
        );
        */
        let count = 0;

        authObservable.filter(
            user => {
                if (user) {
                    if (this.loggedIn) {
                        if (count === 0) {
                            count++;
                            return false;
                        }
                        return true;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            })
            .take(1)
            .subscribe(
            user => {
                this.lastUsedProvider = AuthProviders.EMAIL;
                this.printUserInfo(user);
            },
            err => { this.logger.log(err); this.authResult.next(null); }
            );

    }

    loginAnonymously = () => {

        this.logger.log('attempting anonymous login...');
        let authOptions: AuthServiceOptions = {
            provider: AuthProviders.ANONYMOUS
        }

        let authObservable: Observable<firebase.User> = this.authService.login(authOptions);

        // finally subscribe to login
        authObservable.filter(
            user => {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            }).take(1).subscribe(
            user => {
                this.lastUsedProvider = AuthProviders.ANONYMOUS;
                this.printUserInfo(user);
            },
            err => {
                this.logger.log(err);
                this.authResult.next(null);
            }
            );

    }

    logOut() {
        let authObservable =
            this.authService.logout(this.projectsMgr.projects.default).subscribe(
                result => {
                    this.logger.log('logout result: ' + result);
                    this.loggedIn = false;
                    this.authResult.next(null);
                }
            );
    }

    printUserInfo = (user: firebase.User) => {

        if (!user) {
            this.logger.log('user object returned is null!');
            this.loggedIn = false;
            this.authResult.next(null);
        } else {
            this.lastUserReturned = user;
            this.loggedIn = true;
            this.logger.log('provider: ' + user.providerId);
            this.logger.object(user);
            this.authResult.next(user);
        }
    }



}
