// Required Imports
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

// App Imports
import { EnableSiteMenus } from './core/menus';
import { TestProjectRoutesComponent } from './core/test.component';
import { SelectivePreloadingStrategy } from './core/preloadstrategy';
import { PageNotFoundComponent } from './core/pagenotfound/pagenotfound.component';
import { TestContactUsComponent } from './core/contact/contact.component';
import { LandingPageBootstrapComponent } from './core/landing/bootstrap.component';
import { ErrorPageComponent } from './core/errorpage/error.component';
import { DisableSiteMenus } from './core/menus';


// Router configuration
const rootRouterConfig: Routes = [
  { path: 'landing', component: LandingPageBootstrapComponent, canActivate: [EnableSiteMenus] },
  { path: 'default', component: TestProjectRoutesComponent, canActivate: [EnableSiteMenus] },
  { path: 'contact', component: TestContactUsComponent, canActivate: [EnableSiteMenus] },
  { path: 'error', component: ErrorPageComponent, canActivate: [EnableSiteMenus] },
  {
    path: 'accounts',
    loadChildren: './modules/accounts/accounts.module.ts#UserAccountsFeatureModule',
    data: { preload: true }
  },
  {
    path: 'game',
    loadChildren: './modules/playgame/playgame.module.ts#PlayGameFeatureModule',
    data: { preload: true }
  },
  {
    path: 'activegame',
    loadChildren: './modules/gameloop/gameloop.module.ts#GameLoopFeatureModule'
  },
  {
    path: 'completed',
    loadChildren: './modules/completedgames/completedgames.module#CompletedGamesModule',
  },
  { path: '', redirectTo: 'default', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent, canActivate: [DisableSiteMenus] }
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
