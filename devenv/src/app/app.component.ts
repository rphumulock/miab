// Vendor Imports
import {
    Component, AfterContentInit,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';

// App Imports
import {
    LoggingService,
    ViewPortEvent,
    OrientationState,
    ViewPortManagementService,
    BackgroundManagementService,
    isMobile
} from './shared';
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
    }
    //isHeaderVisible: boolean;
    //logoUrl: string;
    constructor(
        protected logger: LoggingService,
        protected bgManager: BackgroundManagementService,
        protected viewportMgr: ViewPortManagementService, // so DI creates an instance
        protected router: Router) {
        this.title = 'Message in a Bottle';
        this.isMobileDevice = isMobile(logger);

        //this.navService.isVisible.subscribe(val => { this.processMenuOption(val, this.navService, this.logger); });
        // Donte, uncomment below this and change it to the path for our logo starting with '/'
        // this.logoUrl = '<path to our logo>'; 
    }

    ngAfterViewInit() {
        this.bgManager.updateBackground();
        this.viewportMgr.change(false).subscribe(this.monitorOrientation);
    }

    protected monitorOrientation = (event: ViewPortEvent) => {
        this.logger.log('view port manager change detected on root component');

        this.isLandscape = event.orientation === OrientationState.landscape;

        if (this.initialView.isInitial) {
            this.initialView.isLandscape = this.isLandscape;
            this.initialView.isInitial = false;
        } else if (!this.initialView.processed) {
            this.initialView.processed = true;
            if (this.initialView.isLandscape) {
                this.logger.log('requesting change detection!');
                //this.logger.log('current url: ' + this.route.snapshot.url);
                //let url = '/activegame/' + this.route.snapshot.url;
                //this.router.navigate([url]);
                window.location.reload();
            }
        }

    }

    /*
    protected processMenuOption(
        option: NavOptions,
        service: NavMenuService,
        logger: LoggingService) {
        logger.log('appcomponent.ts received menu update: ');
        logger.log(service.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowSettings:
            case NavOptions.ShowNav:
            case NavOptions.ShowHeader:
                logger.log('setting isHeaderVisible to true');
                this.isHeaderVisible = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideHeader:
                logger.log('setting isHeaderVisible to false');
                this.isHeaderVisible = false;
                break;
            default:
                // Do nothing;
                break;
        }
    }
    */

    ngAfterContentInit() {

        // Loader
        $('.loader-img').fadeOut();
        $('.loader').delay(1000).fadeOut('slow');

    }

}
