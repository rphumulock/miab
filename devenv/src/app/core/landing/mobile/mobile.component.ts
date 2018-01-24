// Vendor Imports
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// App Imports
import { NavMenuService, NavOptions } from '../../menus';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'mobile-landing',
    templateUrl: 'mobile.component.html',
    styleUrls: ['mobile.component.css']
})
export class MobileLandingPageComponent {

    showSignUp = false;
    showLogin = false;
    
    constructor(
        public navService: NavMenuService,
        protected router: Router) { 
            this.navService.update(NavOptions.ShowTopMenus);
            this.navService.update(NavOptions.ShowFooter);
        }

    moveBottle() {
        let bottle = document.getElementById('landing-logo');
        bottle.classList.add('moveBottle');
    }
   
    
};


