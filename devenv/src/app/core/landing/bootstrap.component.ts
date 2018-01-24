// Vendor Imports
import { Component, ApplicationRef } from '@angular/core';

// App Imports
import {
    LoggingService, isMobile,
    ViewPortManagementService
} from '../../shared';

/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    template:
        `
    <mobile-landing *ngIf="useMobileView"></mobile-landing>
    <desktop-landing *ngIf="!useMobileView"></desktop-landing>
    `
})
export class LandingPageBootstrapComponent {

    public useMobileView: boolean;
    constructor(
        protected logger: LoggingService) {
        this.useMobileView = isMobile(logger);
    }

};


