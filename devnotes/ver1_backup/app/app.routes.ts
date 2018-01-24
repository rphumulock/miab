import { Routes } from '@angular/router';

import { ContactComponent } from './contact.component';

export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: ContactComponent },
];
