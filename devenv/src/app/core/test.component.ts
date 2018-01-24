// Vendor Imports
import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterStateSnapshot, Routes } from '@angular/router';


// App Imports
import { LoggingService, ViewPortManagementService } from '../shared';
import { NavMenuService } from './menus';

@Component({
    templateUrl: 'test.component.html',
    styleUrls: ['test.component.css']
})
export class TestProjectRoutesComponent implements AfterViewInit {

    constructor(
        protected logger: LoggingService,
        protected navService: NavMenuService,
        protected viewportManagement: ViewPortManagementService,
        protected router: Router) {
    }

    ngAfterViewInit() {

        // This below should be managed by routing guard
        /*
        let outletNav = {
            nav: ['navbar'],
            gear: ['settingsnav'],
            foot: ['footer']
        };

        let options = { outlets: outletNav };

        this.router.navigate(['./', options]);
        */

    }

}


