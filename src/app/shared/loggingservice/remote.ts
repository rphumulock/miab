// Vendor Imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


// App Imports
import {
    AjaxWebRequest,
    RequestMethod,
    RequestOptions
} from 'miablib/global';
import { Configuration } from '../';

require('../resources/cycle');

declare global {
    interface JSON {
        decycle: Function,
        retrocycle: Function
    }
}

interface RemoteLog {
    timestamp: string;
    userid: string;
    ipaddress?: string;
    level: string;
    message: string | any;
}

export enum LoggingLevel {
    error,
    log,
    warn
}

@Injectable()
export class RemoteLoggingService {

    protected currentUser: string;

    constructor(
        protected config: Configuration) { }

    public provideUserId(id: string) {
        this.currentUser = id;
    }

    public log(
        level: LoggingLevel,
        message: string | any) {

        let rMsg: RemoteLog = {
            timestamp: this.getNow(),
            userid: this.currentUser,
            level: this.getLevel(level),
            'message': message
        };

        let headers = new Map<string, string>();
        headers.set('Content-Type', 'application/json');

        let options: RequestOptions = {
            method: RequestMethod.POST,
            url: this.config.REMOTELOGGINGURL,//'http://localhost:8000/logging',
            headers: headers,
            formdata: JSON.stringify(JSON.decycle(rMsg))
        };

        let sendLogRequest = new AjaxWebRequest(options, 2);

        let observable = (sendLogRequest.execute(false) as any) as Observable<any>;
        observable.subscribe(
            res => {
                // do nothing
            });
    }

    protected getLevel(val: LoggingLevel) {
        switch (val) {
            case LoggingLevel.error:
                return 'error';
            case LoggingLevel.warn:
                return 'warn';
            case LoggingLevel.log:
                return 'log';
        }
    }


    getNow(): string {
        let now = new Date(Date.now());
        return now.toUTCString() + ' millisecs: ' + now.getUTCMilliseconds();
    }

}
