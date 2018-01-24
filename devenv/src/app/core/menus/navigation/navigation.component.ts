// Vendor Imports
import { Component } from '@angular/core';
//import * as SlideOut from 'slideout';

// App Imports
import { NavOptions, NavMenuService } from '../navservice';
import { LoggingService } from '../../../shared';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'navigation-component',
    templateUrl: 'navigation.component.html',
    styleUrls: ['navigation.component.css']
})
export class NavigationComponent {

    visible: boolean;
    isActive: boolean;
    //slideOut: SlideOut;
    menuDiv: HTMLDivElement;
    panelDiv: HTMLDivElement;
    constructor(
        public navService: NavMenuService,
        protected logger: LoggingService) {
        this.isActive = false;
        this.navService.isVisible.subscribe(val => { this.processMenuOption(val, this.navService, this.logger); });
    }

    protected processMenuOption(
        option: NavOptions,
        service: NavMenuService,
        logger: LoggingService) {
        //logger.warn('navigation.component.ts received menu update: ');
        //logger.warn(this.navService.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowNav:
            case NavOptions.ShowHeader:
            case NavOptions.ShowTopMenus:
                //this.logger.warn('navigation component changing to visible');
                this.visible = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideNav:
            case NavOptions.HideHeader:
            case NavOptions.HideTopMenus:
                //this.logger.warn('navigation component changing to NOT visible');
                this.visible = false;
                break;
            default:
                // Do nothing;
                break;
        }
        //this.logger.warn('navigation component is visible = ' + this.visible);
    }

    toggleActive() {
        this.isActive = !this.isActive;
    }


};


