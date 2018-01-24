// Vendor Imports
import { Injectable } from '@angular/core';

// App Imports
import { NodePaths, MiabUser } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    FirebaseProjectService,
    LoggingService,
} from '../../../shared';
import { UserSessionManager } from '../../session';



/**
 * This service can be used to retieve user profile details.
 * Right now it only returns the MiabUser object
 */
@Injectable()
export class UserProfileService {

    constructor(
        protected projsMgr: FirebaseProjectService,
        protected userSession: UserSessionManager,
        protected logger: LoggingService) { }

    public getMiabUser(): Promise<MiabUser | null> {

        let promise: any = this.projsMgr.default.db.ref(concatPath([
            NodePaths.MIAB_USERS,
            this.userSession.userId
        ])).once('value')
            .then(
            (snap: firebase.database.DataSnapshot) => {
                if (!snap.exists()) {
                    // if the session was anonymous don't throw an error
                    if (this.userSession.isAnonymous) {
                        return Promise.resolve(null);
                    }

                    return Promise.reject(
                        'unexpected error, user profile for the user ('
                        + this.userSession.userId + ') does not exist!');
                }

                let user: MiabUser = snap.val();
                return Promise.resolve(user);
            });

        return promise;

    }

}


