import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { projectsTypes } from './interface/projectsTypes';
import { ProjectsService } from './service/projects.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private projectsService = inject(ProjectsService);
  private alertService = inject(AlertService);

  project?: Pagination<projectsTypes>;
  projects = signal<projectsTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getProject();
  }

  getProject() {
    this.projectsService.getProjects(this.table.params).subscribe({
      next: (response) => {
        this.project = response;
        this.projects.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getProject());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getProject());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getProject());
  }

  deleteProject(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    this.projectsService.deleteProjects(id).subscribe({
      next: () => this.getProject(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/projects/create']);
  }

  goToEdit(projects: projectsTypes) {
    this.router.navigate(['/admin/projects/update', projects.project_id], {
      state: { projects },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'รหัสโครงการ', key: 'project_code' },
    { label: 'ชื่อโครงการ', key: 'project_name' },
    { label: 'ปีโครงการ', key: 'fiscal_year_name' },
    { label: 'งบประมาณ', key: 'project_budget_amount', type: 'price' },
    { label: 'ผู้รับผิดชอบ', key: 'staff_name' },
  ];
}
