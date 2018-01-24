// Required Imports
import {
    NgModule
} from '@angular/core';

// Vendor Imports
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// App Imports
// import { NavigationComponent } from './components/navigation.component';
// import { FooterComponent } from './components/footer.component';

/**
 * The SharedModule stores and hold common components, 
 * directives, and pipes that are routinely used 
 * in the templates of components in many other modules
 * You may also want to import the modules required for 
 * these shared components
 * 
 * Normally you would manually import this module in 
 * another feature module
 */
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        // NavigationComponent,
        // FooterComponent
    ],
    exports: [
        // You can export commonly used modules. 
        // E.g. if modules that typically import this shared module, 
        // also need form modules, you can export it here even if
        // the imported components of this module do not need the 
        // FormsModule resources.
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})

export class SharedModule { }