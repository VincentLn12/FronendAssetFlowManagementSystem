import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { DepartmentService } from './service/department.service';
import { DepartmentType } from './interface/departmentType';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './departments.component.html',
})
export class DepartmentsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private departmentService = inject(DepartmentService);

  department?: Pagination<DepartmentType>;
  departments = signal<DepartmentType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments() {
    this.departmentService.getDepartments(this.table.params).subscribe({
      next: (response) => {
        this.department = response;
        this.departments.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getDepartments());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getDepartments());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getDepartments());
  }

  deleteDepartment(id: number) {
    this.departmentService.deleteDepartment(id).subscribe({
      next: () => this.getDepartments(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/departments/create']);
  }

  goToEdit(depart: DepartmentType) {
    this.router.navigate(['/admin/departments/update', depart.department_id], {
      state: { depart },
    });
  }

  sortOptions = [
    { label: 'ชื่อ A-Z', value: 'nameAsc' },
    { label: 'ชื่อ Z-A', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ID', key: 'department_id' },
    { label: 'ชื่อคณะ', key: 'department_name' },
  ];
}
