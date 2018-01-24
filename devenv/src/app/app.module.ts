// Required Imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// App Imports
import { AppRouterModule } from './app.router';
import { TestProjectRoutesComponent } from './core/test.component'; 
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent, NavigationComponent, FooterComponent, SettingsMenuComponent } from './core/menus';
import { ErrorPageComponent } from './core/errorpage/error.component';


// App Services
@NgModule({
    imports: [
        BrowserModule,
        NgbModule.forRoot(),
        CoreModule.forRoot(),
        // Finally the app root router module last..
        AppRouterModule,
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        ErrorPageComponent,
        NavigationComponent,
        FooterComponent,
        SettingsMenuComponent
    ],
    bootstrap: [
        AppComponent
    ],
})
export class AppModule { }
