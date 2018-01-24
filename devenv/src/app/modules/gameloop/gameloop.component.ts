// Vendor Imports
import { Component } from '@angular/core';

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
    `,
    providers: []
})
export class RootGameLoopComponent {

}
