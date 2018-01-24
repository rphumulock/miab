// Vendor Imports
import {
    Component,
    AfterContentInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';

// App Imports
import {
    FirebaseAuthService, FirebaseProjectService
} from '../../../shared';
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
export class VerifyEmailComponent implements AfterContentInit {

    constructor(
        public authService: FirebaseAuthService,
        protected projectsMgr: FirebaseProjectService,
        protected ngModalService: NgModalService,
        protected router: Router,
        protected route: ActivatedRoute,
        protected logger: LoggingService) {
    }

    ngAfterContentInit() {
        this.applyActionCode();
    }

    applyActionCode() {

        this.route.queryParamMap.take(1).subscribe(
            params => {
                let actionCode = params.get('oobCode');

                if (!actionCode) {
                    this.logger.error('verify email code unavailable in url parameters.\
                     unable to verify user email address');
                    this.ngModalService.error('Unable to verify your email address!');
                    return;
                }
                this.projectsMgr.default.app.auth().applyActionCode(actionCode)
                    .then(
                    () => {
                        let options = new DialogOptions('Success!',
                            [Buttons.crossClose], 'You\'ve successfully verified your email address!');

                        let modal = this.ngModalService.show(NgModalComponentTemplate, options);

                        modal.result
                            .then(
                            () => { this.router.navigate(['/accounts/profile']) })
                            .catch(
                            () => { this.router.navigate(['/accounts/profile']) })

                        setTimeout(modal.close, 3000, modal);
                    })
                    .catch(err => {
                        this.logger.error(err);
                        this.ngModalService.error('Unable to verify your email address!');
                    });
            });
    }

}
