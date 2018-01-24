// Required Imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { RouterModule } from '@angular/router';
//import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpModule } from '@angular/http';
import { ReactiveFormsModule } from '@angular/forms';

// Import for drag scroll UI
import { DragScrollModule } from 'angular2-drag-scroll';
import { Ng2StickyModule } from 'ng2-sticky';

// App Imports
import { rootRouterConfig } from './app.routes';
import { AppComponent } from './app.component';
import { ContactComponent } from './contact.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(rootRouterConfig, { useHash: true }),
        DragScrollModule,
        Ng2StickyModule,
        ReactiveFormsModule
    ],
    declarations: [
        AppComponent,
        ContactComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
