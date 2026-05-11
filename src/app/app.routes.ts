import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { TestErrorComponent } from './features/test-error/test-error.component';
import { ServerErrorComponent } from './shared/components/server-error/server-error.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { HeaderComponent } from './layout/header/header.component';

export const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./features/account/routes').then((mod) => mod.accountRoutes),
  },
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'test-error', component: TestErrorComponent },
      { path: 'server-error', component: ServerErrorComponent },
      { path: 'not-found', component: NotFoundComponent },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
    ],
  },
];
