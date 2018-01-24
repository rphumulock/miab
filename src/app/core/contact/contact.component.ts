// Vendor Imports
import {
    Component,
    OnInit,
    AfterViewInit
} from '@angular/core';
import {
    Router
} from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { NodePaths, ContactUsMsg } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    EmailValidator,
    FormErrorManager,
    LoggingService,
    isMobile,
    ViewPortManagementService,
    NgModalService,
    FirebaseProjectService,
    ROUTINGTREE
} from '../../shared';
import { NavMenuService, NavOptions } from '../../core/menus';


// declare variable to allow use
declare var grecaptcha;

@Component({
    templateUrl: 'contact.component.html',
    styleUrls: ['contact.component.css'],
    providers: [FormErrorManager]
})
export class ContactUsComponent implements OnInit, AfterViewInit {

    contactUsForm: FormGroup;
    captchaWidgetId: any;
    isUser: boolean;
    isSubmitted: boolean;
    modalRef: NgbModalRef;

    protected validationMessages: Map<string, Map<string, string>>;
    protected formErrors = {
        'email': '',
        'password': '',
        'message': ''
    };

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected formBuilder: FormBuilder,
        protected errorManager: FormErrorManager,
        protected logger: LoggingService,
        protected viewportManager: ViewPortManagementService,
        protected modalService: NgModalService,
        protected router: Router,
        protected navService: NavMenuService) {
        if (!isMobile(this.logger)) {
            navService.update(NavOptions.HideSettings);
        }
    }

    ngOnInit() {
        this.setupAuthFormGroups();
    }

    ngAfterViewInit() {
        this.setupCaptcha();
    }

    protected setupAuthFormGroups() {
        this.contactUsForm = this.formBuilder.group({
            'email': ['',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(36),
                    EmailValidator.validateEmail
                ],
            ],
            'name': ['',
                [
                    Validators.minLength(2),
                    Validators.maxLength(16)
                ],
            ],
            'message': ['',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(480)
                ]
            ],
            'subscribe': ['', []]
        });

        this.initFormErrorManagement();
    }

    protected initFormErrorManagement() {
        let controlNames = ['email', 'name', 'message'];

        this.validationMessages = new Map<string, Map<string, string>>();

        let emailErrors = new Map<string, string>([
            ['required', '*Email is required'],
            ['minlength', '*Email must be at least 6 characters long'],
            ['maxlength', '*Email cannot be more than 36 characters long'],
            ['validateEmail', '*Invalid email format'],
        ]);
        this.validationMessages.set('email', emailErrors);

        let nameErrors = new Map<string, string>([
            ['required', '*Name is required.'],
            ['minlength', '*Name must be at least 2 characters long',],
            ['maxlength', '*Name cannot be more than 16 characters long'],
        ]);
        this.validationMessages.set('name', nameErrors);

        let messageErrors = new Map<string, string>([
            ['required', '*Message is required.'],
            ['minlength', '*Message must be at least 10 characters long',],
            ['maxlength', '*Message cannot be more than 480 characters long'],
        ]);
        this.validationMessages.set('message', messageErrors);

        this.errorManager.initErrorManager(
            this.contactUsForm, controlNames, this.validationMessages);

        this.subscribeToErrorStatus();

    }

    protected subscribeToErrorStatus() {
        this.errorManager.formErrors.get('email').subscribe(err => {
            this.logger.log('email input error received: ' + err);
            this.formErrors.email = err;
        });
        this.errorManager.formErrors.get('name').subscribe(err => {
            this.logger.log('name input error received: ' + err);
            this.formErrors.password = err;
        });
        this.errorManager.formErrors.get('message').subscribe(err => {
            this.logger.log('message input error received: ' + err);
            this.formErrors.message = err;
        });
    }

    protected setupCaptcha() {
        let reCaptchaElemId = 'reCaptchaElem';
        let params = {
            sitekey: '6LeH5yoUAAAAABxSpOqwZUKzKwuzQ7oGaXXQ8CXq',
            size: 'compact',
            callback: 'this.captchaReturned'
        }

        this.captchaWidgetId = grecaptcha.render(
            reCaptchaElemId,
            params
        );

    }

    captchaReturned = (response) => {
        this.logger.log('captchaResponse: ');
        this.logger.object(response);
        this.isUser = true;
    }


    submitMessage() {

        if (this.contactUsForm.invalid || !this.isUser) {
            return;
        }

        let msg: ContactUsMsg = {
            email: this.contactUsForm.controls['email'].value,
            name: this.contactUsForm.controls['name'].value ? this.contactUsForm.controls['name'].value : null,
            message: this.contactUsForm.controls['message'].value,
            subscribe: this.contactUsForm.controls['subscribe'].value,
            captchaToken: grecaptcha.getResponse(this.captchaWidgetId)
        };

        this.projectsMgr.projects.project('crm')
            .db.ref(concatPath([
                NodePaths.CONTACTUS
            ]))
            .push(msg)
            .then(
            () => {
                this.modalRef = this.modalService.waiting('Thank! Your message was sent.\
                 \nNavigating you back to the home page', 'Thanks!');

                setTimeout(this.closeModal, 4000);
                grecaptcha.reset(this.captchaWidgetId);
            })
            .catch(
            err => {
                this.logger.error(err);
                let errMsg = 'Oh no something went wrong! :(';
                errMsg += '\nPlease try again, we really appreciate your feedback!';
                this.modalService.error(errMsg, false, 'Please Try Again', 4000);
            });

    };

    protected closeModal = () => {
        if (this.modalRef) {
            this.modalRef.close();
        }
        this.router.navigate([ROUTINGTREE.landing]);
    }

}


