import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { procurementrecordTypes } from './interface/procurementrecordTypes';
import { ProcurementrecordService } from './service/procurementrecord.service';
import { environment } from '../../../environments/environment.development';
import { ExpensetypesService } from '../expenseTypes/service/expenseTypes.service';
import { FiscalyearsService } from '../fiscalyears/service/fiscalyears.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './procurementrecords.component.html',
})
export class ProcurementrecordComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private table = new TableState();
  private procurementrecordService = inject(ProcurementrecordService);
  private alertService = inject(AlertService);
  private expenseTypeService = inject(ExpensetypesService);
  private fiscalYearService = inject(FiscalyearsService);

  project_id = signal<number | null>(null);
  procurementrecord?: Pagination<procurementrecordTypes>;
  procurementrecords = signal<procurementrecordTypes[]>([]);

  expenseTypes = signal<any[]>([]);
  fiscalYears = signal<any[]>([]);
  expense_type_id = signal<number | null>(null);
  fiscal_year_id = signal<number | null>(null);

  baseFileUrl = environment.baseFileUrl;

  Params = new Params();

  ngOnInit(): void {
    this.loadDropdowns();
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
      .getProcurementrecords(
        this.table.params,
        this.project_id(),
        this.expense_type_id(),
        this.fiscal_year_id(),
      )
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
    this.router.navigate(['/admin/procurements/create']);
  }

  goToEdit(procurementrecord: procurementrecordTypes) {
    this.router.navigate(['/admin/procurements/update', procurementrecord.procurement_record_id], {
      state: { procurementrecord },
    });
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
      case 'pathTo': {
        const expenseType = (procurementrecord.expense_type_name ?? '').trim();

        if (expenseType === 'วัสดุ') {
          this.router.navigate(
            ['/admin/materialReceiveDetails', procurementrecord.procurement_record_id],
            {
              state: { procurementrecord, project_id: this.project_id() },
            },
          );
          return;
        }

        if (expenseType === 'ครุภัณฑ์') {
          this.router.navigate(['/admin/assetItems', procurementrecord.procurement_record_id], {
            state: { procurementrecord, project_id: procurementrecord.project_id },
          });
          return;
        }

        if (expenseType === 'จัดจ้าง') {
          this.router.navigate(['/admin/hireDetails', procurementrecord.procurement_record_id], {
            state: { procurementrecord, project_id: procurementrecord.project_id },
          });
          return;
        }

        console.warn('ไม่พบประเภทค่าใช้จ่าย:', expenseType);
        break;
      }

      case 'withdraw':
        this.router.navigate(['/admin/AssetWithdrawal', procurementrecord.procurement_record_id], {
          state: { procurementrecord },
        });
        break;

      case 'status':
        this.openStatusPicker(procurementrecord);
        break;
    }
  }

  private openStatusPicker(procurementrecord: procurementrecordTypes) {
    const statusOptions = {
      ร่าง: 'ร่าง',
      รออนุมัติ: 'รออนุมัติ',
      อนุมัติแล้ว: 'อนุมัติแล้ว',
      รอเบิกจ่าย: 'รอเบิกจ่าย',
      เบิกจ่ายแล้ว: 'เบิกจ่ายแล้ว',
      ขึ้นทะเบียนแล้ว: 'ขึ้นทะเบียนแล้ว',
      เสร็จสิ้น: 'เสร็จสิ้น',
      ยกเลิก: 'ยกเลิก',
    };

    this.alertService
      .select(
        'เปลี่ยนสถานะเอกสาร',
        `เลขที่เอกสาร ${procurementrecord.document_no}`,
        statusOptions,
        procurementrecord.status,
      )
      .then((result) => {
        if (!result.isConfirmed || !result.value || result.value === procurementrecord.status) {
          return;
        }

        this.procurementrecordService
          .updateProcurementrecordStatus(procurementrecord.procurement_record_id, {
            to_status: result.value,
          })
          .subscribe({
            next: () => {
              this.alertService.successNo('เปลี่ยนสถานะเรียบร้อยแล้ว');
              this.getProcurementrecord();
            },
            error: () => {
              this.alertService.error('เปลี่ยนสถานะไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
            },
          });
      });
  }

  onFilterChange(event: { key: string; value: any }) {
    if (event.key === 'expense_type_id') {
      this.expense_type_id.set(event.value ? Number(event.value) : null);
    }

    if (event.key === 'fiscal_year_id') {
      this.fiscal_year_id.set(event.value ? Number(event.value) : null);
    }

    this.table.params.pageNumber = 1;
    this.getProcurementrecord();
  }

  filterOptions = computed(() => [
    {
      key: 'expense_type_id',
      label: 'ประเภทเบิกจ่าย',
      options: this.expenseTypes().map((x) => ({
        label: x.expense_type_name,
        value: x.expense_type_id,
      })),
    },
    {
      key: 'fiscal_year_id',
      label: 'ปีงบประมาณ',
      options: this.fiscalYears().map((x) => ({
        label: x.fiscal_year,
        value: x.fiscal_year_id,
      })),
    },
  ]);

  loadDropdowns() {
    const expenseParams = new Params();
    expenseParams.pageSize = 100;
    expenseParams.pageNumber = 1;

    const fiscalParams = new Params();
    fiscalParams.pageSize = 100;
    fiscalParams.pageNumber = 1;

    this.expenseTypeService.getExpenseTypes(expenseParams).subscribe({
      next: (res) => {
        this.expenseTypes.set(res.data);
      },
      error: (err) => console.error(err),
    });

    this.fiscalYearService.getFiscalyears(fiscalParams).subscribe({
      next: (res) => {
        this.fiscalYears.set(res.data);
      },
      error: (err) => console.error(err),
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
