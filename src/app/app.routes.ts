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
      { path: '', component: ServerErrorComponent },
      {
        path: 'admin',
        data: { role: 'admin' },
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'departments',
            loadComponent: () =>
              import('./features/departments/departments.component').then(
                (m) => m.DepartmentsComponent,
              ),
          },
          {
            path: 'departments/create',
            loadComponent: () =>
              import('./features/departments/addupdate/addupdate.component').then(
                (m) => m.AddupdateComponent,
              ),
          },
          {
            path: 'departments/update/:id',
            loadComponent: () =>
              import('./features/departments/addupdate/addupdate.component').then(
                (m) => m.AddupdateComponent,
              ),
          },
          {
            path: '**',
            component: NotFoundComponent,
          },
        ],
      },
      { path: 'not-found', component: NotFoundComponent },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
    ],
  },
];
