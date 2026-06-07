import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableState } from '../../../../shared/TableState';
import { ProcurementrecordService } from '../service/procurementrecord.service';
import { AlertService } from '../../../../shared.service';
import { procurementrecordTypes } from '../interface/procurementrecordTypes';
import { Pagination } from '../../../shared/models/pagination';
import { environment } from '../../../../environments/environment.development';
import { Params } from '../../../shared/models/allType';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { projectsTypes } from '../../projects/interface/projectsTypes';

@Component({
  selector: 'app-projectid',
  imports: [DataTableComponent],
  templateUrl: './projectid.component.html',
})
export class ProjectidComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private table = new TableState();
  private procurementrecordService = inject(ProcurementrecordService);
  private alertService = inject(AlertService);

  project_id = signal<number | null>(null);
  procurementrecord?: Pagination<procurementrecordTypes>;
  procurementrecords = signal<procurementrecordTypes[]>([]);

  baseFileUrl = environment.baseFileUrl;
  projectstate = history.state as { projects: projectsTypes } | undefined;
  Params = new Params();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const projectId = Number(params.get('project_id'));

      if (projectId && Number.isFinite(projectId)) {
        this.project_id.set(projectId);
      } else {
        this.project_id.set(null);
      }

      this.getProcurementrecord();
    });
  }

  getProcurementrecord() {
    this.procurementrecordService
      .getProcurementrecords(this.table.params, this.project_id())
      .subscribe({
        next: (response) => {
          this.procurementrecord = response;
          this.procurementrecords.set(response.data);
        },
        error: (error) => console.error(error),
      });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getProcurementrecord());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getProcurementrecord());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getProcurementrecord());
  }

  deleteProcurementrecord(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }

  confirmDelete(id: number) {
    this.procurementrecordService.deleteProcurementrecord(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
        this.getProcurementrecord();
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const projects = this.projectstate;
    this.router.navigate(['/admin/project/procurementrecord/create'], {
      state: { projects },
    });
  }

  goToEdit(procurementrecord: procurementrecordTypes) {
    const projects = this.projectstate;

    this.router.navigate(
      ['/admin/project/procurementrecord/update', procurementrecord.procurement_record_id],
      {
        state: { procurementrecord, projects },
      },
    );
  }

  onTableAction(event: { type: string; item: procurementrecordTypes }) {
    const procurementrecord = event.item;

    switch (event.type) {
      case 'detail':
        this.router.navigate(
          ['/admin/procurements/detail', procurementrecord.procurement_record_id],
          {
            state: { procurementrecord },
          },
        );
        break;

      case 'pathTo':
        if (procurementrecord.expense_type_name === 'ครุภัณฑ์') {
          this.router.navigate(['/admin/assetItems', procurementrecord.procurement_record_id], {
            state: { procurementrecord },
          });
        } else if (procurementrecord.expense_type_name === 'จัดจ้าง') {
          this.router.navigate(['/admin/hireDetails', procurementrecord.procurement_record_id], {
            state: { procurementrecord },
          });
        } else if (procurementrecord.expense_type_name === 'วัสดุ') {
          this.router.navigate(
            ['/admin/materialReceiveDetails', procurementrecord.procurement_record_id],
            {
              state: { procurementrecord },
            },
          );
        }
        break;

      case 'withdraw':
        this.router.navigate(['/admin/AssetWithdrawal', procurementrecord.procurement_record_id], {
          state: { procurementrecord },
        });
        break;
    }
  }
  cancel() {
    this.router.navigate(['/admin/projects']);
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
  }[] = [
    { label: 'วันที่', key: 'document_date', pipe: 'thaiDate' },
    { label: 'เลขที่เอกสาร', key: 'document_no' },
    { label: 'เบิกจ่าย', key: 'expense_type_name' },
    // { label: 'ชื่อบริษัท', key: 'vendor_name' },
    { label: 'ผู้เบิก', key: 'staff_fullname' },
    { label: 'สถานะ', key: 'status', type: 'badge' },
    { label: 'ไฟล์แนบ', key: 'attachment_file_path', type: 'file' },
  ];
}
