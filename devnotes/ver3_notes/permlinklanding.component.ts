// Vendor Imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';


// App Imports
import { UserSessionService } from '../../core/sessionsandaccounts';
import { LoggingService } from '../../shared';

@Component({
    template: ''
})
export class PermlinkLandingComponent implements OnInit {

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected userSession: UserSessionService,
        protected logger: LoggingService) { }

    ngOnInit() {

        this.route.params.switchMap(
            (params: Params) => {
                let userPermlinkCode: string = params['userCode'];
                return userPermlinkCode;
            }).subscribe(
            (userPermlinkCode: string) => {
                this.logger.log('permlink landing page. user code provided: ' + userPermlinkCode);
                this.userSession.parsePermlinkCode(userPermlinkCode);
                this.router
                    .navigate(['gamemenutest']);
            });
    }

}