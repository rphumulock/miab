// Vendor Imports
import { Component } from '@angular/core';

// App Imports
import { NavOptions, NavMenuService } from '../navservice';
import { LoggingService } from '../../../shared';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'footer-component',
    templateUrl: 'footer.component.html',
    styleUrls: ['footer.component.css']
})
export class FooterComponent {

    visible: boolean;
    year: number;
    constructor(
        public navService: NavMenuService,
        protected logger: LoggingService) {
        this.getYear();
        this.navService.isVisible.subscribe(val => { this.processMenuOption(val, this.navService, this.logger); });
    }

    protected getYear() {
        let now = new Date(Date.now());
        this.year = now.getFullYear();
    }

    protected processMenuOption(
        option: NavOptions,
        service: NavMenuService,
        logger: LoggingService) {
        //logger.log('footer.component.ts received menu update: ');
        //logger.log(this.navService.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowFooter:
                this.visible = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideFooter:
                this.visible = false;
                break;
            default:
                // Do nothing;
                break;
        }
    }

};


