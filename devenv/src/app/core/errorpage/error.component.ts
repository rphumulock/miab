// Vendor Imports
import { Component, AfterViewInit } from '@angular/core';


// App Imports
import { LoggingService } from '../../shared';

@Component({
    templateUrl: 'error.component.html',
    styleUrls: ['error.component.css']
})
export class ErrorPageComponent implements AfterViewInit {

    constructor(
        protected logger: LoggingService) {

    }

    ngAfterViewInit() {
    }

}


