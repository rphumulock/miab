// Vendor Imports
import { Injectable } from '@angular/core';
import {
    CanActivate, Router, Route,
    CanActivateChild, CanLoad,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
// import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { Observable } from 'rxjs';
import { LoggingService } from '../../../shared';
import { CurrentLoginGuard } from './currentlogin.guard';
import { RouteCorrectionGuard } from './routecorrection';
import { IRouteGuardStatus } from 'miablib/miab';


@Injectable()
export class AccountsCanActivate implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        protected currentLoginGuard: CurrentLoginGuard,
        protected routeCorrectionGuard: RouteCorrectionGuard,
        protected router: Router,
        protected logger: LoggingService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.logger.log('accounts canactivate guard invoked');
        return this.accountsCanActivate(state.url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.logger.log('accounts canactivatechild guard invoked');
        return this.accountsCanActivate(state.url);
    }

    canLoad(route: Route) {
        this.logger.log('accounts canload guard invoked');
        return this.accountsCanActivate(`/${route.path}`);
    }

    protected accountsCanActivate(url: string): Observable<boolean> {
        let status = this.initStatus(url);

        return Observable.of(false); // temp so compiler works

        
        /*
        let observable: any = this.currentLoginGuard
        .checkUserLogin(url)
        .flatMap(
            result => {
                if (!result) {
                    status.result = false;
                    status.value.loggedin = false;
                    this.logger.object(status);
                    return Observable.of(false);
                } else {
                    status.value.loggedin = true;
                    let validRoute = this.routeCorrectionGuard.validateRoute(url);

                    if ( validRoute ) {
                        status.result = true;
                        status.value.validroute = true;
                    } else {
                        status.result = false;
                        status.value.validroute = false;
                    }

                    this.logger.object(status);
                    return Observable.of(status.result);
                }
            });

        return observable;
        */
    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'accounts canactivate guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'currently logged in & valid route',
            value: { loggedin: false, validroute: null },
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}
