// Vendor Imports
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// App Imports
import { FirebaseAuthService } from '../../../shared';
import { UserSessionManager } from '../../../modules/session';
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

    constructor(
        public authService: FirebaseAuthService,
        public userSession: UserSessionManager,
        public navService: NavMenuService,
        protected router: Router) { 
            this.navService.update(NavOptions.ShowTopMenus);
            this.navService.update(NavOptions.ShowFooter);
        }

    showSignUp(): boolean {
        return !this.authService.loggedIn || this.userSession.isAnonymous;
    }

    moveBottle() {
        let bottle = document.getElementById('landing-logo');
        bottle.classList.add('moveBottle');
    }
};


