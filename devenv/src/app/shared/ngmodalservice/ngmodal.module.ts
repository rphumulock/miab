// Required Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import { NgModalComponentTemplate } from './ngmodal.template';
import { NgModalService } from './ngmodal.service';
import { NgModalServiceTestComponent } from './test.component';


const testRoutes: Routes = [
    {
        path: 'modaltest',
        component: NgModalServiceTestComponent
    }
];

// App Services
@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        RouterModule.forChild(testRoutes)
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
        NgbModule
    ],
    /**
     * Declare out reusable component template
     */
    declarations: [
        NgModalServiceTestComponent,
        NgModalComponentTemplate
    ],
    /**
     * Add it as an entry template so Angular compiler does not remove
     * its references. 
     * https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-entry-component-defined
     */
    entryComponents: [
        NgModalComponentTemplate
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
    providers: [NgModalService]
})
export class NgModalServiceModule { }
