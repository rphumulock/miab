// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports
import {
    LoggingLevel,
    RemoteLoggingService
} from './remote';

enum LogTarget {
    local,
    remote,
    all
}

@Injectable()
export class LoggingService {

    protected isDev: boolean;
    protected target = LogTarget.local;//LogTarget.all;
    protected verbose = true;

    constructor(
        protected remote: RemoteLoggingService) {
        this.isDev = process.env.ENV !== 'production';
    }

    protected logRemote(): boolean {
        return this.target === LogTarget.all || this.target === LogTarget.remote;
    }

    protected logLocal(): boolean {
        return this.target === LogTarget.all || this.target === LogTarget.local;
    }

    public log(message: string) {
        if (this.isDev || this.verbose) {
            let msg = this.getTimePrefix() + message;

            if (this.logRemote()) {
                this.remote.log(LoggingLevel.log, message);
            }

            if (this.logLocal()) {
                console.log(msg);
            }

        }
    }

    public object(obj: any) {
        if (this.isDev || this.verbose) {

            if (this.logRemote()) {
                this.remote.log(LoggingLevel.log, obj);
            }

            if (this.logLocal()) {
                console.log(this.getTimePrefix());
                console.log(obj);
            }

        }
    }

    public warn(message: any) {
        if (this.isDev || this.verbose) {

            if (this.logRemote()) {
                this.remote.log(LoggingLevel.warn, message);
            }

            if (this.logLocal()) {
                if ((typeof message) === 'string') {
                    console.warn('|#|' + this.getNow() + '|#| ' + message);
                } else {
                    console.warn('|#|' + this.getNow() + '|#| ');
                    console.warn(message);
                }
            }
        }
    }

    public error(message: any) {

        if (this.logRemote()) {
            this.remote.log(LoggingLevel.error, message);
        }

        if (this.logLocal()) {
            if ((typeof message) === 'string') {
                console.error('|#|' + this.getNow() + '|#| ' + message);
            } else {
                console.error('|#|' + this.getNow() + '|#| ');
                console.error(message);
            }
        }
    }

    getTimePrefix(): string {
        return '|#|' + this.getNow() + '|#| ';
    }

    getNow(): string {
        let now = new Date(Date.now());
        return now.toUTCString() + ' millisecs: ' + now.getUTCMilliseconds();
    }

}
