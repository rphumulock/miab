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
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

// App Imports
import {
    EmailValidator, PasswordValidator,
    FormErrorManager
} from '../../../shared';
import {
    LoggingService, NgModalService,
    ViewPortManagementService
} from '../../../shared';



/**
 * To-do:
 * Styling 
 * Error Alerting... example: https://scotch.io/tutorials/angular-2-form-validation
 * Show Proper Elements when appropriate:
 *      - Show displayname field when user is signing up
 */
@Component({
    templateUrl: 'verify.component.html',
    styleUrls: ['verify.component.css'],
    providers: [FormErrorManager]
})
export class VerifyEmailTestComponent {


}