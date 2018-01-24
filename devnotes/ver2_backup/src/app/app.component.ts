// Vendor Imports
import { Component, AfterContentInit, ViewEncapsulation } from '@angular/core';
//import { GameSessionService } from './services/gamesession.service';

// App Imports

/**
 * Purpose: Root component that is bootstraped by NgModule
 * 
 * Major Component/Elements: the application title, and deactiving the loading.gif
 * 
 * To-do:
 * 
 */
@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.css'],
    // https://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html
    encapsulation: ViewEncapsulation.None//,
    // This tells angular to instantiate, this is a global service so doing it on the root component
    // https://angular.io/docs/ts/latest/cookbook/dependency-injection.html
    //providers: [ GameSessionService ]
})
export class AppComponent implements AfterContentInit {

    title = 'Message In A Bottle';

    constructor() { }

    ngAfterContentInit() {

        // Loader
        $('.loader-img').fadeOut();
        $('.loader').delay(1000).fadeOut('slow');

    }

}
