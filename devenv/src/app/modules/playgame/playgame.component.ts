// Vendor Imports
import {
    Component, AfterContentInit
} from '@angular/core';
import * as $ from 'jquery';

// App Imports
import { LoggingService } from '../../shared';

/**
 * Purpose: Root component that is bootstraped by NgModule 
 * for the playgame feature module
 * 
 * To-do:
 * 
 */
@Component({
    template:
    `
    <router-outlet></router-outlet>
    <ng-template ngbModalContainer></ng-template>
    `
})
export class RootGameComponent implements AfterContentInit {

    ngAfterContentInit() {

        // Loader
        $('.loader-img').fadeOut();
        $('.loader').delay(1000).fadeOut('slow');

    }

}
