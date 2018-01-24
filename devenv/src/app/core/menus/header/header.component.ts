// Vendor Imports
import { Component } from '@angular/core';

// App Imports
import { NavOptions, NavMenuService } from '../navservice';
import { LoggingService } from '../../../shared';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'header-component',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.css']
})
export class HeaderComponent {

    visible: boolean;
    showHeaderImg: boolean;
    logoUrl: string;
    constructor(
        public navService: NavMenuService,
        protected logger: LoggingService) {
        this.showHeaderImg = false;
        this.visible = false;
        this.logoUrl = '/img/miab-logo-clear2.png';
        this.navService.isVisible.subscribe(val => { this.processMenuOption(val, this.navService, this.logger); });
    }

    protected processMenuOption(
        option: NavOptions,
        service: NavMenuService,
        logger: LoggingService) {
        // logger.log('header.component.ts received menu update: ');
        // logger.log(this.navService.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowHeader:
                this.visible = true;
                this.showHeaderImg = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideHeader:
                this.visible = false;
                break;
            case NavOptions.ShowTopMenus:
                this.visible = true;
                this.showHeaderImg = false;
                break;
            case NavOptions.HideTopMenus:
                this.visible = false;
                break;
            default:
                // Do nothing;
                break;
        }
    }

};


