// Vendor Imports
import {
    Component, AfterContentInit,
    ViewEncapsulation
} from '@angular/core';
import * as $ from 'jquery';

// App Imports
import { Configuration, isMobile } from './shared';
import {
    OrientationState,
    ViewPortEvent,
    ViewPortManagementService,
    BackgroundManagementService
} from './shared/services/'; // use fqdn
import {
    SessionBootstrapManager
} from './modules/session';

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
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterContentInit {

    title: string;
    isLandscape: boolean = false;
    isMobileDevice: boolean;
    initialView = {
        isInitial: true,
        isLandscape: false,
        processed: false
    };

    constructor(
        protected config: Configuration,
        protected viewportMgr: ViewPortManagementService,
        protected bgManager: BackgroundManagementService,
        protected sessionBootrapMgr: SessionBootstrapManager
    ) {
        this.title = config.TITLE;
        this.isMobileDevice = isMobile();
    }

    ngAfterViewInit() {
        this.bgManager.updateBackground();
        this.viewportMgr.change(false).subscribe(this.monitorOrientation);
    }

    ngAfterContentInit() {
        // Loader
        $('.loader-img').fadeOut();
        $('.loader').delay(1000).fadeOut('slow');
    }

    protected monitorOrientation = (event: ViewPortEvent) => {

        this.isLandscape = event.orientation === OrientationState.landscape;

        if (this.initialView.isInitial) {
            this.initialView.isLandscape = this.isLandscape;
            this.initialView.isInitial = false;
        } else if (!this.initialView.processed) {
            this.initialView.processed = true;
            if (this.initialView.isLandscape) {
                window.location.reload();
            }
        }

    }

}
