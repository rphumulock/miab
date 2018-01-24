// Vendor Imports
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// App Imports
import { NavMenuService, NavOptions } from '../../menus';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'desktop-landing',
    templateUrl: 'desktop.component.html',
    styleUrls: ['desktop.component.css']
})
export class DesktopLandingPageComponent {

    constructor(
        public navService: NavMenuService,
        protected router: Router) { 
            this.navService.update(NavOptions.HideSettings);
            this.navService.update(NavOptions.ShowFooter);
        }

    showSignUp(): boolean {
        return false;
    }

    moveBottle() {
        let bottle = document.getElementById('landing-logo');
        bottle.classList.add('moveBottle');
    }
   
    
};


