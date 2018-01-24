// Vendor Imports
import { Component, AfterViewChecked } from '@angular/core';
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
export class NavigationComponent implements AfterViewChecked {

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
        // logger.log('navigation.component.ts received menu update: ');
        // logger.log(this.navService.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowNav:
            case NavOptions.ShowHeader:
            case NavOptions.ShowTopMenus:
                this.visible = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideNav:
            case NavOptions.HideHeader:
            case NavOptions.HideTopMenus:
                this.visible = false;
                break;
            default:
                // Do nothing;
                break;
        }
    }

    ngAfterViewChecked() {

        /*
        if ( !this.menuDiv ) {
            let domObj = document.getElementById('menu') as HTMLDivElement;

            if ( domObj ) {
            this.logger.log('Initiating Nav Menu Objects');
            this.menuDiv = domObj;
            this.logger.log('MenuDiv Element Object: ');
            this.logger.object(this.menuDiv);
            }
        }

        if ( !this.panelDiv ) {
                 let domObj = document.getElementById('panel') as HTMLDivElement;

            if ( domObj ) {
            this.logger.log('Initiating Nav Panel Objects');
            this.panelDiv = domObj;
            this.logger.log('PanelDiv Element Object: ');
            this.logger.object(this.panelDiv);
            }
        }

        
        if ( !this.slideOut && this.menuDiv && this.panelDiv ) {
            this.setupSlideOut();
        }
        */
    }

    toggleActive() {
        this.isActive = !this.isActive;
    }

    /*protected setupSlideOut() {
        let options = {
            panel: document.getElementById('panel'),
            menu: document.getElementById('menu')
        };

        this.slideOut = new SlideOut(options);

    }*/


};


