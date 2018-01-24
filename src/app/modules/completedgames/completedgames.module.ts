// Vendor Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DragScrollModule } from './angular2-drag-scroll';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';


// App Imports
import { CompletedGamesComponent } from './completedgames.component';
import { UserSessionGuard } from '../session/guards';
import { EnableSiteMenus } from '../../core/menus';
import { UserGamesResolveGuard } from './guards/usergames.resolve';
import { CompletedGamesCanActivate } from './guards/canactivate.guard';
import { GameDetailsService } from './services/gamedetails.service';
import { PlayerGamesService } from './services/playergames.service';
import { IsMobileDeviceGuard } from '../../shared';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [IsMobileDeviceGuard,UserSessionGuard,
                    CompletedGamesCanActivate],
                children: [
                    {
                        path: '',
                        component: CompletedGamesComponent,
                        canActivate: [EnableSiteMenus],
                        resolve: {
                            games: UserGamesResolveGuard
                        }
                    }
                ]
            }
        ]
    }
];

// App Services
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DragScrollModule,
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
        CompletedGamesComponent,
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
    providers: [
        GameDetailsService,
        PlayerGamesService,
        CompletedGamesCanActivate,
        UserGamesResolveGuard
    ]
})
export class CompletedGamesModule { }