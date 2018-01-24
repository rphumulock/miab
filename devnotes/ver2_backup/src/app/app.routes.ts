import { Routes } from '@angular/router';


import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
import { GameCodeComponent } from './gamecode/gamecode.component';
import { LobbyComponent } from './lobby/lobby.component';
import { DrawingFrameComponent } from './drawingframe/drawingframe.component';
import { TextFrameComponent } from './textframe/textframe.component';
import { UserChestComponent } from './userchest/userchest.component';


export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'gamecode', component: GameCodeComponent },
  { path: 'lobby', component: LobbyComponent },
  { path: 'drawingframe', component: DrawingFrameComponent },
  { path: 'textframe', component: TextFrameComponent },
  { path: 'userchest', component: UserChestComponent }
  //{ path: '**', component: PageNotFoundComponent }
];
/*
// Temp config for landing page only...
export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'contact', pathMatch: 'full' },
  { path: 'contact', component: ContactComponent }
];
*/