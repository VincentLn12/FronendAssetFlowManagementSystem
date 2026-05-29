import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { TestErrorComponent } from './features/test-error/test-error.component';
import { ServerErrorComponent } from './shared/components/server-error/server-error.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { HeaderComponent } from './layout/header/header.component';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

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
        canActivate: [authGuard, adminGuard],
        data: { role: 'admin' },
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          // แผนก
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
          // คำนำหน้า
          {
            path: 'prefixes',
            loadComponent: () =>
              import('./features/prefixes/prefixes.component').then((m) => m.PrefixesComponent),
          },
          {
            path: 'prefixes/create',
            loadComponent: () =>
              import('./features/prefixes/prefixesaddupdate/addupdate.component').then(
                (m) => m.PrefixesAddUpdateComponent,
              ),
          },
          {
            path: 'prefixes/update/:id',
            loadComponent: () =>
              import('./features/prefixes/prefixesaddupdate/addupdate.component').then(
                (m) => m.PrefixesAddUpdateComponent,
              ),
          },
          // ตำเเหน่ง
          {
            path: 'positions',
            loadComponent: () =>
              import('./features/positions/positions.component').then((m) => m.PositionsComponent),
          },
          {
            path: 'positions/create',
            loadComponent: () =>
              import('./features/positions/positionsaddupdate/addupdate.component').then(
                (m) => m.PositionsAddUpdateComponent,
              ),
          },
          {
            path: 'positions/update/:id',
            loadComponent: () =>
              import('./features/positions/positionsaddupdate/addupdate.component').then(
                (m) => m.PositionsAddUpdateComponent,
              ),
          },
          // พนักงาน
          {
            path: 'staffs',
            loadComponent: () =>
              import('./features/staffs/staffs.component').then((m) => m.StaffsComponent),
          },
          {
            path: 'staffs/create',
            loadComponent: () =>
              import('./features/staffs/staffsTypeaddupdate/addupdate.component').then(
                (m) => m.StaffAddUpdateComponent,
              ),
          },
          {
            path: 'staffs/update/:id',
            loadComponent: () =>
              import('./features/staffs/staffsTypeaddupdate/addupdate.component').then(
                (m) => m.StaffAddUpdateComponent,
              ),
          },
          // บทบาท
          {
            path: 'roles',
            loadComponent: () =>
              import('./features/roles/roles.component').then((m) => m.RolesComponent),
          },
          {
            path: 'roles/create',
            loadComponent: () =>
              import('./features/roles/roleTypeaddupdate/addupdate.component').then(
                (m) => m.RolesAddUpdateComponent,
              ),
          },
          {
            path: 'roles/update/:id',
            loadComponent: () =>
              import('./features/roles/roleTypeaddupdate/addupdate.component').then(
                (m) => m.RolesAddUpdateComponent,
              ),
          },
          // ผู้ใช้งาน
          {
            path: 'users',
            loadComponent: () =>
              import('./features/users/users.component').then((m) => m.UsersComponent),
          },
          // ปีงบประมาณ
          {
            path: 'fiscalyears',
            loadComponent: () =>
              import('./features/fiscalyears/fiscalyears.component').then(
                (m) => m.FiscalyearsComponent,
              ),
          },
          {
            path: 'fiscalyears/create',
            loadComponent: () =>
              import('./features/fiscalyears/fiscalyearsaddupdate/addupdate.component').then(
                (m) => m.FiscalyearsAddUpdateComponent,
              ),
          },
          {
            path: 'fiscalyears/update/:id',
            loadComponent: () =>
              import('./features/fiscalyears/fiscalyearsaddupdate/addupdate.component').then(
                (m) => m.FiscalyearsAddUpdateComponent,
              ),
          },
          // ประเภทการดำเนินงาน
          {
            path: 'OperationTypes',
            loadComponent: () =>
              import('./features/operationTypes/operations.component').then(
                (m) => m.OperationsComponent,
              ),
          },
          {
            path: 'OperationTypes/create',
            loadComponent: () =>
              import('./features/operationTypes/operationTypesaddupdate/addupdate.component').then(
                (m) => m.OperationTypesAddUpdateComponent,
              ),
          },
          {
            path: 'OperationTypes/update/:id',
            loadComponent: () =>
              import('./features/operationTypes/operationTypesaddupdate/addupdate.component').then(
                (m) => m.OperationTypesAddUpdateComponent,
              ),
          },
          // ประเภทการเบิกจ่าย
          {
            path: 'expensetypes',
            loadComponent: () =>
              import('./features/expenseTypes/expensetypes.component').then(
                (m) => m.ExpensetypesComponent,
              ),
          },
          {
            path: 'expensetypes/create',
            loadComponent: () =>
              import('./features/expenseTypes/expenseTypesaddupdate/addupdate.component').then(
                (m) => m.ExpenseTypesAddUpdateComponent,
              ),
          },
          {
            path: 'expensetypes/update/:id',
            loadComponent: () =>
              import('./features/expenseTypes/expenseTypesaddupdate/addupdate.component').then(
                (m) => m.ExpenseTypesAddUpdateComponent,
              ),
          },
          // หมวดเงิน
          {
            path: 'fundcategorys',
            loadComponent: () =>
              import('./features/fundcategorys/fundcategorys.component').then(
                (m) => m.FundcategorysComponent,
              ),
          },
          {
            path: 'fundcategorys/create',
            loadComponent: () =>
              import('./features/fundcategorys/fundcategorysaddupdate/addupdate.component').then(
                (m) => m.FundcategorysAddUpdateComponent,
              ),
          },
          {
            path: 'fundcategorys/update/:id',
            loadComponent: () =>
              import('./features/fundcategorys/fundcategorysaddupdate/addupdate.component').then(
                (m) => m.FundcategorysAddUpdateComponent,
              ),
          },
          // แหล่งงบประมาณ
          {
            path: 'budgetsources',
            loadComponent: () =>
              import('./features/budgetsource/budgetsources.component').then(
                (m) => m.BudgetsourcesComponent,
              ),
          },
          {
            path: 'budgetsources/create',
            loadComponent: () =>
              import('./features/budgetsource/budgetsourceaddupdate/addupdate.component').then(
                (m) => m.BudgetsourcesAddUpdateComponent,
              ),
          },
          {
            path: 'budgetsources/update/:id',
            loadComponent: () =>
              import('./features/budgetsource/budgetsourceaddupdate/addupdate.component').then(
                (m) => m.BudgetsourcesAddUpdateComponent,
              ),
          },
          // โครงการ
          {
            path: 'projects',
            loadComponent: () =>
              import('./features/projects/projects.component').then((m) => m.ProjectsComponent),
          },
          {
            path: 'projects/create',
            loadComponent: () =>
              import('./features/projects/projectsaddupdate/addupdate.component').then(
                (m) => m.ProjectsAddUpdateComponent,
              ),
          },
          {
            path: 'projects/update/:id',
            loadComponent: () =>
              import('./features/projects/projectsaddupdate/addupdate.component').then(
                (m) => m.ProjectsAddUpdateComponent,
              ),
          },
          // ร้านค้า
          {
            path: 'vendors',
            loadComponent: () =>
              import('./features/vendors/vendors.component').then((m) => m.VendorsComponent),
          },
          {
            path: 'vendors/create',
            loadComponent: () =>
              import('./features/vendors/vendorsaddupdate/addupdate.component').then(
                (m) => m.VendorsAddUpdateComponent,
              ),
          },
          {
            path: 'vendors/update/:id',
            loadComponent: () =>
              import('./features/vendors/vendorsaddupdate/addupdate.component').then(
                (m) => m.VendorsAddUpdateComponent,
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
