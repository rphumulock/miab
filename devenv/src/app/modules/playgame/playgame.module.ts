// Required Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';

/**
 * Required in modules that are lazy loaded for so the NgbModalService
 * will use the appropriate ComponentFactoryResolver and Injectors
 * 
 * See:
 * https://github.com/ng-bootstrap/ng-bootstrap/issues/947
 * 
 * If facing similar issues in other lazy loaded dynamic modules
 * see the example, solution here:
 * https://github.com/angular/angular/issues/14324
 */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import { RootGameComponent } from './playgame.component';
import {
    IsMobileDeviceGuard
} from '../../shared/guards';
import { EnableSiteMenus, DisableSiteMenus } from '../../core/menus';
import { TestGameMenuComponent } from './gamemenu/gamemenu.component';
import { TestLobbyComponent } from './lobby/lobby.component';
import { GameCodeModalComponent } from './ngmodal/gamecode.modal';
import { NgModalServiceModule } from '../../shared/ngmodalservice/ngmodal.module';

const routes: Routes = [
    {
        path: '',
        component: RootGameComponent,
        canActivate: [IsMobileDeviceGuard],
        //canActivateChild: [GameSessionGuard],
        children: [
            {
                path: '',
                children: [
                    {
                        path: 'menu',
                        component: TestGameMenuComponent,
                        canActivate: [EnableSiteMenus]
                    },
                    {
                        path: 'lobby',
                        component: TestLobbyComponent,
                        canActivate: [DisableSiteMenus]
                    },
                    {
                        path: '',
                        redirectTo: 'menu',
                        pathMatch: 'full'
                    }
                ]
            }
        ]
    },
];

// App Services
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgModalServiceModule,
        RouterModule.forChild(routes)
    ],
    /**
     * To share modules, components, directives or pipes, you 
     * must explicity re-export them from a feature module if other
     * modules are expected to have access and use them
     * 
     * You can also list export modules without this module needing it
     * nor importing it.
     */
    exports: [
    ],
    /**
     * Declare out reusable component template
     */
    declarations: [
        RootGameComponent,
        TestGameMenuComponent,
        TestLobbyComponent,
        GameCodeModalComponent
    ],
    /**
     * Add it as an entry template so Angular compiler does not remove
     * its references. 
     * https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-entry-component-defined
     */
    entryComponents: [
    ],
    /**
     * The root module and the feature module share the same execution context. 
     * They share the same dependency injector, 
     * which means the services in one module are available to all.
     * 
     * Do not specify app-wide singleton providers in a shared module. 
     * A lazy-loaded module that imports that shared module makes its own copy of the service.
     * 
     * This current design works for us because we only import this module once
     * in the root module
     * 
     * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#core-for-root
     */
    providers: []
})
export class PlayGameFeatureModule { }
