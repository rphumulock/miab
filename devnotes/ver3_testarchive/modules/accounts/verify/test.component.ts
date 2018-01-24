// Vendor Imports
import {
    Component
} from '@angular/core';
import * as firebase from 'firebase';

// App Imports
import { } from '../../../shared';
import {
    LoggingService, NgModalService,
    NgModalComponentTemplate, DialogOptions,
    Buttons
} from '../../../shared';


@Component({
    templateUrl: 'verify.component.html',
    styleUrls: ['verify.component.css']
})
export class VerifyEmailTestComponent {

    constructor(
        protected ngModalService: NgModalService,
        protected logger: LoggingService) {
    }

    showSuccess() {
        let options = new DialogOptions('Success!',
            [Buttons.crossClose], 'You\'ve successfully verified your email address!');

        this.ngModalService.show(NgModalComponentTemplate, options);
    }

    showFailure() {
        this.ngModalService.error('Unable to verify your email address!');
    }

}
