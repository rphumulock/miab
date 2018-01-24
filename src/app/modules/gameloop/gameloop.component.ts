// Vendor Imports
import { Component } from '@angular/core';

// App Imports
import { GameLoopBootstrapManager } from './bootstrap.manager';

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
export class RootGameLoopComponent {
    constructor(
        protected bootstrapManager: GameLoopBootstrapManager
    ) {}
}
