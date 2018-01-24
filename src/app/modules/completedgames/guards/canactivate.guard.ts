// Vendor Imports
import { Injectable } from '@angular/core';
import {
    CanActivate, Router,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
// import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { Observable } from 'rxjs';
import { LoggingService, ROUTINGTREE } from '../../../shared';
import { IRouteGuardStatus } from 'miablib/miab';
import { PlayerGamesService } from '../services/playergames.service';


@Injectable()
export class CompletedGamesCanActivate implements CanActivate, CanActivateChild {
    constructor(
        protected games: PlayerGamesService,
        protected router: Router,
        protected logger: LoggingService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.logger.log('completed games canactivate guard invoked');
        return this.completedGamesCanActivate(state.url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.logger.log('completed games canactivatechild guard invoked');
        return this.completedGamesCanActivate(state.url);
    }

    protected completedGamesCanActivate(url: string): Observable<boolean> {

        let status = this.initStatus(url);

        return this.games.hasCompletedGames()
            .map(
            result => {
                // update & log guard status object
                status.value = result;
                status.result = result;

                if (!status.result) {
                    let onPageLanding = status.from.length === 0;
                    if ( onPageLanding ) {
                        this.router.navigate([ROUTINGTREE.landing]);
                    }
                }

                this.logger.object(status);

                return result;
            });

    }

    protected initStatus(url: string): IRouteGuardStatus {
        let status: IRouteGuardStatus = {
            guard: 'completed games canactivate guard',
            from: this.router.routerState.snapshot.url,
            to: url,
            result: false,
            condition: 'has completed games',
            value: false,
            route_changed: false,
            new_route: null,
            error_msg: null,
        };

        return status;
    }

}
