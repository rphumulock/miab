// Vendor Imports
import { Component } from '@angular/core';

// App Imports

/**
 * The user accounts management feature module 
 * root component
 */
@Component({
    template:
    `
    <router-outlet></router-outlet>
    <ng-template ngbModalContainer></ng-template>
    `,
    styleUrls: ['accounts.component.css']
})
export class RootAccountsComponent {
}