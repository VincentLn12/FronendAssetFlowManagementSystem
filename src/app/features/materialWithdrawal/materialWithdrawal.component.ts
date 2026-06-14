import { Params } from './../../shared/models/allType';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { AlertService } from '../../../shared.service';
import { MaterialWithdrawalService } from './service/materialWithdrawal.service';
import { TableState } from '../../../shared/TableState';
import { MaterialWithdrawalTypes } from './interface/materialWithdrawalTypes';

@Component({
  selector: 'app-material-withdrawal',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './materialWithdrawal.component.html',
})
export class MaterialWithdrawalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialWithdrawalService = inject(MaterialWithdrawalService);
  private alertService = inject(AlertService);
  private location = inject(Location);
  private table = new TableState();
  Params = new Params();

  procurement_record_id = signal<number | null>(null);

  materialWithdrawal?: Pagination<MaterialWithdrawalTypes>;
  materialWithdrawals = signal<MaterialWithdrawalTypes[]>([]);
  totalCount = signal<number>(0);

  headerColor = 'bg-green-700';
  headerBorderColor = 'border-green-700';
  butttonColor = 'bg-green-700 hover:bg-green-800';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.loadMaterialWithdrawal(id);
    }
  }

  loadMaterialWithdrawal(id: number) {
    this.materialWithdrawalService
      .getMaterialWithdrawalbyProcuremens(this.table.params, id)
      .subscribe({
        next: (response) => {
          this.materialWithdrawal = response;
          this.materialWithdrawals.set(response.data);
          this.totalCount.set(response.count);
        },
        error: (error) => console.error(error),
      });
  }

  onSearch(value: string) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onSearch(value, () => this.loadMaterialWithdrawal(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onPageChange(page, () => this.loadMaterialWithdrawal(id));
  }

  onSort(value: string) {
    const id = this.procurement_record_id();
    if (!id) return;

    this.table.onSort(value, () => this.loadMaterialWithdrawal(id));
  }

  deleteMaterialWithdrawal(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();
    if (!procurementId) return;

    this.materialWithdrawalService.deleteMaterialWithdrawal(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.loadMaterialWithdrawal(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const procurementId = this.procurement_record_id();
    if (!procurementId) return;

    this.router.navigate(['/admin/MaterialWithdrawal/create'], {
      queryParams: {
        procurement_record_id: procurementId,
      },
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  goToEdit(mat: MaterialWithdrawalTypes) {
    this.router.navigate(['/admin/MaterialWithdrawal/update', mat.material_withdrawal_id], {
      state: {
        materialWithdrawal: mat,
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  sortOptions = [
    { label: 'ใบเบิก ก-ฮ', value: 'nameAsc' },
    { label: 'ใบเบิก ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge'; pipe?: 'thaiDate' }[] =
    [
      { label: 'ใบเบิกเลขที่', key: 'withdrawal_document_no' },
      { label: 'อ้างอิงเอกสารจัดซื้อเลขที่', key: 'material_receive_id' },
      { label: 'อ้างอิงเอกสารตรวจรับเลขที่', key: 'receive_document_no' },
      { label: 'ผู้เบิก', key: 'staff_name' },
      { label: 'หมายเหตุ', key: 'remark' },
    ];

  cancel() {
    this.router.navigate(['/admin/project/procurementrecord'], {
      queryParams: {
        project_id: history.state?.procurementrecord?.project_id,
      },
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }
}
