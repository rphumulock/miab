// Required Imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// App Imports
import { AppRouterModule } from './app.router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from './core/core.module';
import { NgModalServiceModule } from './shared/ngmodalservice';
import { SessionManagementModule } from './modules/session';

// Component Imports
import { AppComponent } from './app.component';
import { HeaderComponent, NavigationComponent, FooterComponent, SettingsMenuComponent } from './core/menus';
import { ErrorPageComponent } from './core/errorpage/error.component';

// Feature Module Imports (non-lazy loaded)

// App Services
@NgModule({
    imports: [
        BrowserModule,
        NgbModule.forRoot(),
        CoreModule.forRoot(),
        NgModalServiceModule,
        SessionManagementModule,
        // Other major module imports (non-lazy loaded)
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
