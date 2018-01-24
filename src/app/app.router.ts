// Required Imports
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// App Imports
import { EnableSiteMenus } from './core/menus';
import { SelectivePreloadingStrategy } from './core/preloadstrategy';
import { PageNotFoundComponent } from './core/pagenotfound/pagenotfound.component';
import { ContactUsComponent } from './core/contact/contact.component';
import { LandingPageBootstrapComponent } from './core/landing/bootstrap.component';
import { ErrorPageComponent } from './core/errorpage/error.component';

// Router configuration
const rootRouterConfig: Routes = [
  { path: 'landing', component: LandingPageBootstrapComponent, canActivate: [EnableSiteMenus] },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'contact', component: ContactUsComponent, canActivate: [EnableSiteMenus] },
  { path: 'error', component: ErrorPageComponent, canActivate: [EnableSiteMenus] },
  {
    path: 'accounts',
    loadChildren: 'app/modules/accounts/accounts.module.ts#UserAccountsFeatureModule',
    data: { preload: true }
  },
  {
    path: 'game',
    loadChildren: 'app/modules/playgame/playgame.module.ts#PlayGameFeatureModule',
    data: { preload: true }
  },
  {
    path: 'activegame',
    loadChildren: 'app/modules/gameloop/gameloop.module.ts#GameLoopFeatureModule'
  },
  {
    path: 'completed',
    loadChildren: 'app/modules/completedgames/completedgames.module#CompletedGamesModule',
  },
  { path: '**', component: PageNotFoundComponent }
];


// Module Export
@NgModule({
  imports: [
    RouterModule.forRoot(
      rootRouterConfig,
      {
        enableTracing: process.env.ENV === 'production' ? false : false, //true, // for troubleshooting...
        useHash: false,
        preloadingStrategy: SelectivePreloadingStrategy
      }
    ),
  ],
  exports: [
    RouterModule
  ]
})
export class AppRouterModule { }
