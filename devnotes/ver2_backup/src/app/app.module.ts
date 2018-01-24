// Required Imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Import for drag scroll UI
import { DragScrollModule } from './directives/angular2-drag-scroll';
//import { Ng2StickyModule } from 'ng2-sticky';

// Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import '../polyfills.browser';
//import { landingAppConfig,productionAppConfig,devAppConfig,myFirebaseAuthConfig } from './services/auth.config';

// App Imports
import { rootRouterConfig } from './app.routes';
import { AppComponent } from './app.component';
import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
import { GameCodeComponent } from './gamecode/gamecode.component';
import { LobbyComponent } from './lobby/lobby.component';
import { DrawingFrameComponent } from './drawingframe/drawingframe.component';
import { TextFrameComponent } from './textframe/textframe.component';
import { UserChestComponent } from './userchest/userchest.component';
import { NgbdModalComponent } from './ngbdmodal/ngbdmodal.component';
import { NgbdModalService } from './services/ngbdmodal.service';


// App Services
import { GameSessionService } from './services/gamesession.service';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(rootRouterConfig, { useHash: true }),
        ReactiveFormsModule,
        DragScrollModule,
        NgbModule.forRoot()
    ],
    declarations: [
        AppComponent,
        LandingComponent,
        ContactComponent,
        GameCodeComponent,
        LobbyComponent,
        DrawingFrameComponent,
        TextFrameComponent,
        UserChestComponent
    ],
    entryComponents: [NgbdModalComponent],
    providers: [GameSessionService, NgbdModalService],
    bootstrap: [AppComponent],
})
export class AppModule { }
