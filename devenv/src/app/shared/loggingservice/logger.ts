// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports



@Injectable()
export class LoggingService {

    constructor() { }

    public log(message: string) {
        console.log(message);
    }

    public object(obj: any) {
        console.log(this.getTimePrefix());
        console.log(obj);
    }

    public warn(message: any) {
        if ((typeof message) === 'string') {
            console.warn('|#|' + this.getNow() + '|#| ' + message);
        } else {
            console.warn('|#|' + this.getNow() + '|#| ');
            console.warn(message);
        }
    }

    public error(message: any) {
        if ((typeof message) === 'string') {
            console.error('|#|' + this.getNow() + '|#| ' + message);
        } else {
            console.error('|#|' + this.getNow() + '|#| ');
            console.error(message);
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
