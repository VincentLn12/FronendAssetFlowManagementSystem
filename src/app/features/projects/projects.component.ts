import { Params } from './../../shared/models/allType';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { projectsTypes } from './interface/projectsTypes';
import { ProjectsService } from './service/projects.service';
import { environment } from '../../../environments/environment.development';
import { FiscalyearsService } from '../fiscalyears/service/fiscalyears.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private router = inject(Router);
  table = new TableState();
  private projectsService = inject(ProjectsService);
  private fiscalYearService = inject(FiscalyearsService);
  private alertService = inject(AlertService);

  project?: Pagination<projectsTypes>;
  projects = signal<projectsTypes[]>([]);
  baseFileUrl = environment.baseFileUrl;

  fiscalYears = signal<any[]>([]);
  fiscal_year_id = signal<number | null>(null);

  Params = new Params();

  ngOnInit(): void {
    this.loadDropdowns();
    this.getProject();
  }

  getProject() {
    this.projectsService.getProjects(this.table.params, this.fiscal_year_id()).subscribe({
      next: (response) => {
        this.project = response;
        this.projects.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  loadDropdowns() {
    const params = new Params();
    params.pageSize = 100;

    this.fiscalYearService.getFiscalyears(params).subscribe({
      next: (res) => this.fiscalYears.set(res.data),
      error: (err) => console.error(err),
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

  onFilterChange(event: any) {
    this.fiscal_year_id.set(Number(event.value) || null);
    this.table.params.pageNumber = 1;
    this.getProject();
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

  gotoPathTo(event: { type: string; item: projectsTypes }) {
    const projects = event.item;

    if (event.type !== 'pathTo') return;

    this.router.navigate(['/admin/project/procurementrecord'], {
      queryParams: {
        project_id: projects.project_id,
      },
      state: { projects },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: {
    label: string;
    key: string;
    type?: 'text' | 'price' | 'badge' | 'file';
    pipe?: 'thaiDate';
    sortAsc?: string;
    sortDesc?: string;
  }[] = [
    {
      label: 'วันที่สร้าง',
      key: 'created_at',
      pipe: 'thaiDate',
      sortDesc: 'latest',
      sortAsc: 'oldest',
    },
    {
      label: 'รหัสโครงการ',
      key: 'project_code',
      sortAsc: 'nameAsc',
      sortDesc: 'nameDesc',
    },
    {
      label: 'ปีโครงการ',
      key: 'fiscal_year_name',
    },
    {
      label: 'งบประมาณ',
      key: 'project_budget_amount',
      type: 'price',
    },
    {
      label: 'ผู้รับผิดชอบ',
      key: 'staff_name',
    },
    {
      label: 'ไฟล์แนบ',
      key: 'filePath',
      type: 'file',
    },
  ];
  filterOptions = computed(() => [
    {
      key: 'fiscal_year_id',
      label: 'ปีงบประมาณ',
      options: this.fiscalYears().map((x) => ({
        label: x.fiscal_year,
        value: x.fiscal_year_id,
      })),
    },
  ]);
}
