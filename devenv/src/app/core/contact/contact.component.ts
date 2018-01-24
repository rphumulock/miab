// Vendor Imports
import {
    Component,
    OnInit,
    AfterViewInit
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
import { NodePaths, ContactUsMsg } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { EmailValidator } from '../../shared/validators';
import { FormErrorManager
} from '../../shared';
import { LoggingService, ViewPortManagementService } from '../../shared';
import { NavMenuService, NavOptions } from '../../core/menus';

// declare variable to allow use
declare var grecaptcha;

@Component({
    templateUrl: 'contact.component.html',
    styleUrls: ['contact.component.css'],
    providers: [FormErrorManager]
})

export class TestContactUsComponent implements OnInit, AfterViewInit {

    contactUsForm: FormGroup;
    captchaWidgetId: any;
    isUser: boolean;
    isSubmitted: boolean;

    constructor(
        protected formBuilder: FormBuilder,
        protected router: Router,
        protected logger: LoggingService,
        protected viewportManager: ViewPortManagementService,
        protected navService: NavMenuService) {
    }

    ngOnInit() {
        this.setupAuthFormGroups();
    }

    ngAfterViewInit() {
        this.setupCaptcha();
    }

    hideFooter() {
        this.navService.update(NavOptions.HideFooter);
    }

    showFooter() {
        this.navService.update(NavOptions.ShowFooter);
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

        this.contactUsForm.valueChanges
            .subscribe(data => this.onContactUsValueChanged(data));

        this.onContactUsValueChanged();
    }

    protected setupCaptcha() {

        let reCaptchaElemId = 'reCaptchaElem';

        let params = {
            sitekey: '6LeH5yoUAAAAABxSpOqwZUKzKwuzQ7oGaXXQ8CXq',
            size: 'normal',
            callback: this.captchaReturned
        }

        this.captchaWidgetId = grecaptcha.render(reCaptchaElemId, params);

        this.logger.log('captcha widget id returned: ' + this.captchaWidgetId);

    }

    captchaReturned = (response) => {
        this.logger.log('captchaResponse: ');
        this.logger.object(response);
        this.isUser = true;
    }

    protected formErrors = {
        'email': '',
        'name': '',
        'message': ''
    };

    protected validationMessages = {
        'email': {
            'required': '*Email is required',
            'minlength': '*Email must be at least 6 characters long',
            'maxlength': '*Email cannot be more than 36 characters long',
            'validateEmail': '*Non-valid Email format'
        },
        'name': {
            'minlength': '*Name must be at least 2 characters long',
            'maxlength': '*Name cannot be more than 16 characters long',
        },
        'message': {
            'required': '*Message is required.',
            'minlength': '*Message must be at least 10 characters long',
            'maxlength': '*Message cannot be more than 480 characters long',
            'haslowercase': '*Your Password must include lower-case characters',
            'hasuppercase': '*Your Password must include upper-case characters'
        }
    };


    onContactUsValueChanged(data?: any) {
        const form = this.contactUsForm;
        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    invalidate() {
        return { invalid: true };
    }

    displayUserNameErrors(): boolean {
        let nameVal = this.contactUsForm.controls['name'].value as String;
        return nameVal.length > 0;
    }

    submitMessage() {
        this.logger.object(grecaptcha);

        let result = grecaptcha.getResponse(this.captchaWidgetId);

        let msg: ContactUsMsg = {
            email: this.contactUsForm.controls['email'].value,
            name: this.contactUsForm.controls['name'].value ? this.contactUsForm.controls['name'].value : null,
            message: this.contactUsForm.controls['message'].value,
            subscribe: this.contactUsForm.controls['subscribe'].value,
            captchaToken: result
        }

        this.logger.log('message request details: ');
        this.logger.object(this.contactUsForm);
        this.logger.log('message: ');
        this.logger.object(msg);
        this.logger.log('captcha done: ' + this.isUser);
        this.logger.log(grecaptcha.getResponse(this.captchaWidgetId));

    }


}


