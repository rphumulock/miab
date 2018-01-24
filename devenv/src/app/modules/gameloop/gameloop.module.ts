// Required Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { HttpModule } from '@angular/http';

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
import { DisableSiteMenus } from '../../core/menus';
import { RootGameLoopComponent } from './gameloop.component';
import { NgModalServiceModule } from '../../shared/ngmodalservice/ngmodal.module';
import { TwemojiService } from './twemoji/twemoji.service';
import { EmojiResolveGuard } from './twemoji/emoji-resolve.guard';

//import { ViewManagerService } from './drawinglibrary';

// App Imports - Testing
import { TestTextFrameComponent } from './textframe/text.component';
import {
    TestBaseDrawingComponent,
    TestDrawingBootstrapComponent,
    TestMobileDrawingComponent,
    TestFullViewDrawingComponent
} from './drawingframe';
import { NoViewComponent } from './noview/noview.component';
import { NoViewService } from './noview/noview.service';
import { IsMobileDeviceGuard } from '../../shared';

const routes: Routes = [
    {
        path: '',
        component: RootGameLoopComponent,
        canActivate: [IsMobileDeviceGuard],
        children: [
            {
                path: '',
                children: [
                    {
                        path: 'noview',
                        component: NoViewComponent
                    },
                    {
                        path: 'drawing',
                        component: TestDrawingBootstrapComponent,
                        canActivate: [DisableSiteMenus],
                        resolve: {
                            emoji: EmojiResolveGuard
                        }
                    },
                    {
                        path: 'text',
                        component: TestTextFrameComponent,
                        canActivate: [DisableSiteMenus]
                    },
                    {
                        path: '',
                        redirectTo: 'text',
                        pathMatch: 'full'
                    },
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
        NgModalServiceModule,
        HttpModule,
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
        RootGameLoopComponent,
        NoViewComponent,
        TestTextFrameComponent,
        TestBaseDrawingComponent,
        TestDrawingBootstrapComponent,
        TestMobileDrawingComponent,
        TestFullViewDrawingComponent
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
        TwemojiService, EmojiResolveGuard,
        NoViewService
    ]
})
export class GameLoopFeatureModule { }
