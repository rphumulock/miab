// Vendor Imports
import {
    NgModule, ModuleWithProviders,
    Optional, SkipSelf
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import { SelectivePreloadingStrategy } from './preloadstrategy';
import { NgModalServiceModule } from '../shared/ngmodalservice';
import { IsMobileDeviceGuard } from '../shared/guards';
import {
    DisableSiteMenus, EnableSiteMenus,
    HideFooter, HideHeader, ShowFooter,
    ShowHeader
} from './menus';

// Components
import { TestProjectRoutesComponent } from './test.component';
import { DesktopLandingPageComponent } from './landing/desktop/desktop.component';
import { MobileLandingPageComponent } from './landing/mobile/mobile.component';
import { LandingPageBootstrapComponent } from './landing/bootstrap.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { TestContactUsComponent } from './contact/contact.component';
import { NavMenuService } from './menus';
import { 
    LoggingService, 
    ViewPortManagementService,
    BackgroundManagementService
} from '../shared';

/**
 * This module is intended to store single use classes that are used
 * only by the root AppComponent. 
 * 
 * However providers defined here are available application wide and 
 * as such is also a great place to define application wide services
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgModalServiceModule,
        RouterModule
    ],
    declarations: [
        TestProjectRoutesComponent,
        MobileLandingPageComponent,
        DesktopLandingPageComponent,
        LandingPageBootstrapComponent,
        PageNotFoundComponent,
        TestContactUsComponent,
    ],
    providers: [
        LoggingService,
        SelectivePreloadingStrategy,
        IsMobileDeviceGuard,
        NavMenuService, DisableSiteMenus,
        EnableSiteMenus, HideFooter,
        HideHeader, ShowFooter, ShowHeader,
        ViewPortManagementService,
        BackgroundManagementService
    ]
})
export class CoreModule {
    /**
     * A module that adds providers to the application can offer a facility for 
     * configuring those providers as well.
     * 
     * By convention, the forRoot static method both provides and configures 
     * services at the same time. It takes a service configuration object and 
     * returns a ModuleWithProviders, which is a simple object with the 
     * following properties:
     * 
     * ngModule: the CoreModule class
     * providers: the configured providers
     * 
     * The root AppModule imports the CoreModule and adds the providers to the AppModule providers.
     * 
     * More precisely, Angular accumulates all imported providers before appending
     *  the items listed in @NgModule.providers. This sequence ensures that 
     * whatever you add explicitly to the AppModule providers takes precedence 
     * over the providers of imported modules.
     * 
     * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
     */
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            // This tells angular to instantiate, this is a global service so doing it on the root component
            // https://angular.io/docs/ts/latest/cookbook/dependency-injection.html
            providers: []
        };
    }

    /**
     * Call forRoot only in the root application module, AppModule. 
     * Calling it in any other module, particularly in a lazy-loaded module, 
     * is contrary to the intent and can produce a runtime error.
     * 
     * You could hope that no developer makes that mistake. 
     * Or you can guard against it and fail fast by adding the following
     * CoreModule constructor.
     * 
     * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
     * @param parentModule 
     */
    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only');
        }
    }
}