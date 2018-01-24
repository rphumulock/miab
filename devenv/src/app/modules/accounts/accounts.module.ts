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
import { RootAccountsComponent } from './accounts.component';
import { EnableSiteMenus } from '../../core/menus';
import { UserProfileTestComponent } from './profile/test.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './signup/signup.component';
import { VerifyEmailTestComponent } from './verifyemail/test.component';
import {
    PasswordResetRequestComponent, 
    PasswordResetComponent,
    PasswordResetRootComponent
} from './passwordreset';
import { 
    NgModalServiceModule, 
    IsMobileDeviceGuard 
} from '../../shared';

const routes: Routes = [
    {
        path: '',
        component: RootAccountsComponent,
        canActivate: [IsMobileDeviceGuard],
        children: [
            {
                path: '',
                canActivateChild: [EnableSiteMenus],
                children: [
                    {
                        path: 'login',
                        component: LoginComponent
                    },
                    {
                        path: 'signup',
                        component: SignUpComponent,
                    },
                    {
                        path: 'verify',
                        component: VerifyEmailTestComponent
                    },
                    {
                        path: 'profile',
                        component: UserProfileTestComponent
                    },
                    {
                        path: 'reset',
                        component: PasswordResetRootComponent,
                        children: [
                            {
                                path: 'request',
                                component: PasswordResetRequestComponent,
                            },
                            {
                                path: 'finish',
                                component: PasswordResetComponent,
                            },
                            {
                                path: '',
                                redirectTo: 'request',
                                pathMatch: 'prefix'
                            }
                        ]
                    },
                    {
                        path: '',
                        redirectTo: 'login',
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
        RootAccountsComponent,
        LoginComponent,
        SignUpComponent,
        VerifyEmailTestComponent,
        UserProfileTestComponent,
        PasswordResetRootComponent,
        PasswordResetRequestComponent,
        PasswordResetComponent
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
export class UserAccountsFeatureModule { }
