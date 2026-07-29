import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { assetWithdrawalTypes } from './interface/assetWithdrawalTypes';
import { AssetWithdrawalService } from './service/assetWithdrawal.service';
import { TableState } from '../../../shared/TableState';
import { Location } from '@angular/common';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './assetWithdrawal.component.html',
})
export class AssetWithdrawalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetWithdrawalService = inject(AssetWithdrawalService);
  private alertService = inject(AlertService);
  private table = new TableState();
  private location = inject(Location);

  procurement_record_id = signal<number | null>(null);
  assetWithdrawal?: Pagination<assetWithdrawalTypes>;
  assetWithdrawals = signal<assetWithdrawalTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);

  headerColor = 'bg-slate-700';
  headerBorderColor = 'border-slate-700';
  butttonColor = 'bg-slate-700 hover:bg-slate-800 ';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    const procurementrecord = history.state?.procurementrecord;

    console.log(procurementrecord);

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.LoadgetAssetWithdrawal(id);
    }
  }

  LoadgetAssetWithdrawal(id: number) {
    this.assetWithdrawalService.getAssetWithdrawalbyProcuremens(this.table.params, id).subscribe({
      next: (response) => {
        this.assetWithdrawals.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetWithdrawal(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetWithdrawal(id));
  }

  onSort(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetWithdrawal(id));
  }

  deleteAssetWithdrawal(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();

    if (!procurementId) return;

    this.assetWithdrawalService.deleteAssetWithdrawal(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetWithdrawal(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const procurementId = this.procurement_record_id();
    const procurementrecord = history.state?.procurementrecord;

    if (!procurementId) return;

    this.router.navigate(['/admin/AssetWithdrawal/create'], {
      queryParams: {
        procurement_record_id: procurementId,
      },
      state: {
        procurementrecord,
      },
    });
  }

  goToEdit(mat: assetWithdrawalTypes) {
    this.router.navigate(['/admin/AssetWithdrawal/update', mat.procurement_withdrawal_id], {
      state: {
        assetWithdrawal: mat,
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }

  onTableAction(event: { type: string; item: assetWithdrawalTypes }) {
    const mat = event.item;

    const stateData = {
      assetItem: mat,
      procurementrecord: history.state?.procurementrecord,
      procurement_record_id: this.procurement_record_id(),
      procurement_withdrawal_id: mat.procurement_withdrawal_id,
    };

    if (event.type === 'repair') {
      this.router.navigate(['/admin/assetRepairs', mat.procurement_withdrawal_id], {
        state: stateData,
      });
      return;
    }

    if (event.type === 'history') {
      this.router.navigate(['/admin/AssetSubItemHistory', mat.procurement_withdrawal_id], {
        state: stateData,
      });
    }
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge'; pipe?: 'thaiDate' }[] =
    [
      { label: 'ครั้งที่', key: 'withdrawal_document_no' },
      { label: 'วันที่เบิก', key: 'withdrawal_date', pipe: 'thaiDate' },
      { label: 'สิ้นสุดดูแล', key: 'end_date', pipe: 'thaiDate' },
      { label: 'สถานะ', key: 'end_reason' },
      { label: 'ผู้เบิก', key: 'staff_name' },
      { label: 'สถานที่เก็บ', key: 'storage_location' },
      { label: 'รายระเอียด', key: 'remark' },
    ];

  cancel() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin/procurementrecord']);
    }
    // this.router.navigate(['/admin/project/procurementrecord'], {
    //   queryParams: {
    //     project_id: history.state?.procurementrecord?.project_id,
    //   },
    //   state: { procurementrecord: history.state?.procurementrecord },
    // });
  }
}
