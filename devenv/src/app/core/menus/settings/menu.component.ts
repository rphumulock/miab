// Vendor Imports
import {
    Component,
    OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { LoggingService } from '../../../shared';
import { NavOptions, NavMenuService } from '../navservice';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'settings-component',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.component.css']
})
export class SettingsMenuComponent {

    visible: boolean;
    isActive: boolean;

    allowUserProfile = false;
    allowCompletedGames = false;
    
    accountOption = 'Login'

    constructor(
        public navService: NavMenuService,
        protected router: Router,
        protected logger: LoggingService) {
        this.isActive = false;
        this.navService.isVisible.subscribe(val => { this.processMenuOption(val, this.navService, this.logger); });
    }

    protected processMenuOption(
        option: NavOptions,
        service: NavMenuService,
        logger: LoggingService) {
        // logger.log('menu.component.ts received menu update: ');
        // logger.log(this.navService.mapping(option));
        switch (option) {
            case NavOptions.ShowAll:
            case NavOptions.ShowSettings:
            case NavOptions.ShowHeader:
            case NavOptions.ShowTopMenus:
                this.visible = true;
                break;
            case NavOptions.HideAll:
            case NavOptions.HideSettings:
            case NavOptions.HideHeader:
            case NavOptions.HideTopMenus:
                this.visible = false;
                break;
            default:
                // Do nothing;
                break;
        }
    }

    protected navHome(event: MouseEvent) {
        this.toggleActive(event);
        this.router.navigate(['/']);
    }

    protected navUserProifle(event: MouseEvent) {
        if (!this.allowUserProfile) {
            return;
        }
        this.toggleActive(event);
        this.router.navigate(['/accounts/profile']);
    }

    protected navUserSession(event: MouseEvent) {

        this.toggleActive(event);

        switch(this.accountOption) {
            case 'Login':
            this.router.navigate(['/accounts/login']);
            break;

            case 'SignUp':
            this.router.navigate(['/accounts/signup']);
            break;

            default:
            // do nothing
            break;
        }

    }

    navToCompletedGames(event: MouseEvent) {
        if (!this.allowCompletedGames) {
            return;
        }
        this.toggleActive(event);
        this.router.navigate(['/completed']);
    }

    toggleToInActive() {
        //this.logger.log('toggle gearmenu is active event firing..');
        //this.logger.log('before change: ' + this.isActive);
        this.isActive = false;
        //this.logger.log('after change: ' + this.isActive);
    }

    toggleActive(event: MouseEvent) {
        //this.logger.log('toggle gearmenu is active event firing..');
        //this.logger.log('before change: ' + this.isActive);
        this.isActive = !this.isActive;
        //this.logger.log('after change: ' + this.isActive);

        if (this.isActive) {
            //this.logger.log('manually applying focus');
            document.addEventListener('click', this.isInMenu);
            let menu = document.getElementById('settingsmenu')
            setTimeout(() => {
                //this.logger.log('manual focus callback active');
                menu.focus();
            }, 0);
        }

        event.stopPropagation();
    }

    isInMenu = (event: MouseEvent) => {
        let menu = document.getElementById('settingsmenu');
        let icon = document.getElementById('settingsicon');

        let withInMenu = false;

        if (!menu || !icon) {
            withInMenu = false;
        } else {
            withInMenu = event.target !== icon &&
            (event.target === menu || menu.contains(event.target as Node));
        }

        //this.logger.log('click event recieved with menu open! isInMenu?: ' + withInMenu);

        if (!withInMenu) {
            //this.logger.log('removing document click listener and closing menu');
            this.isActive = false;
            document.removeEventListener('click', this.isInMenu);
        }
    }

};


