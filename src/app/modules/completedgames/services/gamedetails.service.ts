// Vendor Imports
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

// App Imports
import {
    NodePaths,
    Game, Scroll,
    MiabUser,
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    SessionEventsBroker
} from '../../session';
import { LoggingService, FirebaseProjectService } from '../../../shared';

/**
 * This service can be used to retreive details about a particular
 * game. Details would include things like the games scrolls and 
 * a given scrolls frames
 */
@Injectable()
export class GameDetailsService {

    constructor(
        protected projsMgr: FirebaseProjectService,
        protected eventsBroker: SessionEventsBroker,
        protected logger: LoggingService) { }

    public getScrolls(game: Game): Observable<Array<Scroll>> {

        let scrolls = new Array<Scroll>();

        let scrollsObservable: Observable<Scroll> = Observable.create(
            (observer: Observer<Scroll>) => {

                game.scrolls.forEach(
                    (entry, index) => {
                        this.getScroll(entry).subscribe(
                            scroll => {
                                observer.next(scroll);

                                if (index === (game.scrolls.length - 1)) {
                                    observer.complete();
                                }
                            },
                            err => {
                                observer.error(err);
                            });
                    });
            });

        return Observable.create(
            (observer: Observer<Array<Scroll>>) => {
                scrollsObservable
                    .subscribe(
                    scroll => {
                        scrolls.push(scroll);
                    },
                    err => {
                        observer.error(err);
                    },
                    () => {
                        observer.next(scrolls);
                        observer.complete();
                    });
            });
    }

    public getScroll(scrollId: string): Observable<Scroll> {

        let promise: any = this.projsMgr.default.db.ref(concatPath([
            NodePaths.SCROLLS,
            scrollId
        ])).once('value')
            .then(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    return Promise.reject('user profile does not exist!');
                }

                let user: MiabUser = snap.val();
                return Promise.resolve(user);
            });

        return promise;

    }

}

