import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { assetItemsTypes } from './interface/assetItemsTypes';
import { AssetItemsService } from './service/assetItems.service';
import { TableState } from '../../../shared/TableState';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './assetItems.component.html',
})
export class AssetItemsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetItemsService = inject(AssetItemsService);
  private alertService = inject(AlertService);
  private table = new TableState();

  procurement_record_id = signal<number | null>(null);
  assetItem?: Pagination<assetItemsTypes>;
  assetItems = signal<assetItemsTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    const procurementrecord = history.state?.procurementrecord;

    // ถ้าไม่มี state แปลว่าเข้าจากการพิมพ์ URL เอง
    if (!procurementrecord) {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    // กันประเภทผิด
    if (procurementrecord.expense_type_name !== 'ครุภัณฑ์') {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    if (id && Number.isFinite(id)) {
      this.procurement_record_id.set(id);
      this.LoadgetAssetItems(id);
    }
  }

  LoadgetAssetItems(id: number) {
    this.assetItemsService.getAssetItembyProcuremen(this.table.params, id).subscribe({
      next: (response) => {
        this.assetItems.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetItems(id));
  }

  onPageChange(page: number) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetItems(id));
  }

  onSort(value: string) {
    const id = this.procurement_record_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetItems(id));
  }

  deleteAssetItems(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.procurement_record_id();

    if (!procurementId) return;

    this.assetItemsService.deleteAssetItems(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetItems(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const procurementId = this.procurement_record_id();

    if (!procurementId) return;

    this.router.navigate(['/admin/assetItems/create'], {
      queryParams: {
        procurement_record_id: procurementId,
      },
    });
  }

  goToEdit(mat: assetItemsTypes) {
    this.router.navigate(['/admin/assetItems/update', mat.asset_id], {
      state: {
        assetItem: mat,
      },
    });
  }

  goToAssetsubItems(mat: assetItemsTypes) {
    this.router.navigate(['/admin/assetsubItems', mat.asset_id], {
      state: {
        assetItem: mat,
        procurementrecord: history.state?.procurementrecord,
        procurement_record_id: this.procurement_record_id(),
      },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge'; pipe?: 'thaiDate' }[] =
    [
      { label: 'รหัส', key: 'asset_code_prefix' },
      { label: 'ชื่อครุภัณฑ์', key: 'asset_name' },
      { label: 'วันที่รับ', key: 'receive_date', pipe: 'thaiDate' },
      { label: 'ผู้เบิก', key: 'staff_name' },
    ];

  cancel() {
    this.router.navigate(['/admin/procurements']);
  }
}
