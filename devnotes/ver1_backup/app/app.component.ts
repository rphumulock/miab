import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    /**
     * Angular offers interfaces for tapping into critical moments 
     * in the component lifecycle: at creation, after each change, 
     * and at its eventual destruction.
     * 
     * https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
     */

    constructor() { }

}
