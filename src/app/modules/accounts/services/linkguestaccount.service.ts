// Vendor Imports 
import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable, Subject } from 'rxjs';


// App Imports
import {
    NodePaths,
    LinkAccountStatus,
    LinkGuestAccountRequest
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import {
    FirebaseObservable,
    SubscribeOptions, EventTypes
} from 'miablib/firebaseutil';
import { LoggingService, FirebaseProjectService } from '../../../shared/';
import { UserSessionManager } from '../../session';


@Injectable()
export class LinkGuestAccountService {

    protected permlinkCode: string;
    get guestAccountPermlinkCode(): string { return this.permlinkCode; }

    protected guestAccountId: string;

    protected subject: Subject<boolean>;

    protected request: LinkGuestAccountRequest;
    get linkAccountStatus(): LinkAccountStatus {
        return this.request.status;
    }

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected userSession: UserSessionManager,
        protected logger: LoggingService) {
    }

    public canLinkGuestAccount(): boolean {

        let isValidRegisteredUser =
            this.userSession.isInitialized && !this.userSession.isAnonymous ? true : false;

        let isValidGuestAcctUser =
            this.permlinkCode && this.guestAccountId ? true : false;

        return isValidRegisteredUser && isValidGuestAcctUser;

    }

    public linkGuestAccount(): Observable<boolean> {

        this.subject = new Subject<boolean>();

        this.request = new LinkGuestAccountRequest();
        this.request.guestSessionUserId = this.guestAccountId;
        this.request.miabUserId = this.userSession.userId;
        this.request.permlinkCode = this.permlinkCode;

        this.initAccountUpgrade();

        return this.subject.asObservable();

    }

    /**
     * This should only be called from the PermlinkValidationService
     * @param permlink validated permlink code
     * @param guestAcctId associated guest account id
     */
    public provideValidatedPermlinkDetails(
        permlink: string, guestAcctId: string) {
        this.permlinkCode = permlink;
        this.guestAccountId = guestAcctId;
    }

    /**
     * This should only be called from the PermlinkValidationService
     */
    public resetPermlinkDetails(){
        this.permlinkCode = null;
        this.guestAccountId = null;
    }

    protected initAccountUpgrade() {

        this.logger.log(
            `validating if eligble guest session available to 
            "link" or associate with this account...`
        );

        if (!this.canLinkGuestAccount) {
            this.logger.log(`cannot link a guest account, requirements missings...`);
            this.subject.next(false);
            return;
        }

        // Update this so the server knows a request has started
        this.request.status = LinkAccountStatus.requested;

        let upgradeRef: firebase.database.Reference =
            this.projectsMgr.default.db.ref(concatPath([
                NodePaths.LINKGUEST_ACCOUNT_REQUESTS
            ])).push();

        let options: SubscribeOptions = {
            node: upgradeRef.child('status'),
            eventType: EventTypes.VALUE,
            existsOnly: true,
        };

        let fbRx = new FirebaseObservable(
            this.projectsMgr.default.app,
            options
        );

        fbRx.getObservable()
            .filter(
            (value: LinkAccountStatus) => {
                if (value == LinkAccountStatus.requested) {
                    return false;
                } else {
                    return true;
                }
            }).take(1)
            .subscribe(
            (result: LinkAccountStatus) => {

                this.request.status = result;
                this.logger.log('result returned from server: ' + result);

                switch (result) {

                    case LinkAccountStatus.completed:
                        this.request.status = result;
                        this.subject.next(true);
                        break;

                    case LinkAccountStatus.error:
                        this.request.status = LinkAccountStatus.error;
                        this.subject.next(false);
                        this.logger.log('some error occurred unable to upgrade your account');
                        break;

                    default:
                        this.request.status = LinkAccountStatus.error;
                        this.subject.next(false);
                        this.logger.log('some error occurred unable to upgrade your account');
                        break;
                }

                upgradeRef.update({ 'status': LinkAccountStatus.acknowledged });
            });

        upgradeRef.set(this.request);

    }
}


