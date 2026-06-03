import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { TableState } from '../../../shared/TableState';
import { AssetRepairsService } from './service/assetRepairs.service';
import { assetRepairsTypes } from './interface/assetRepairsTypes';
import { ThaiDatePipe } from '../../shared/pipes/thai-date-pipe';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [ThaiDatePipe],
  templateUrl: './assetRepairs.component.html',
})
export class AssetRepairsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetRepairsService = inject(AssetRepairsService);
  private alertService = inject(AlertService);
  private table = new TableState();

  asset_id = signal<number | null>(null);
  assetRepair?: Pagination<assetRepairsTypes>;
  assetRepairs = signal<assetRepairsTypes[]>([]);
  Params = new Params();
  totalCount = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    const procurementrecord = history.state?.procurementrecord;

    // // ถ้าไม่มี state แปลว่าเข้าจากการพิมพ์ URL เอง
    // if (!procurementrecord) {
    //   this.router.navigate(['/admin/procurements']);
    //   return;
    // }

    // // กันประเภทผิด
    // if (procurementrecord.expense_type_name !== 'ครุภัณฑ์') {
    //   this.router.navigate(['/admin/procurements']);
    //   return;
    // }

    if (id && Number.isFinite(id)) {
      this.asset_id.set(id);
      this.LoadgetAssetRepairs(id);
    }
  }

  LoadgetAssetRepairs(id: number) {
    this.assetRepairsService.getAssetRepairsby(this.table.params, id).subscribe({
      next: (response) => {
        this.assetRepairs.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetRepairs(id));
  }

  onPageChange(page: number) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetRepairs(id));
  }

  onSort(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetRepairs(id));
  }

  deleteAssetRepairs(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    const procurementId = this.asset_id();

    if (!procurementId) return;

    this.assetRepairsService.deleteAssetRepairs(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetRepairs(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const asset_ids = this.asset_id();

    if (!asset_ids) return;

    this.router.navigate(['/admin/assetRepairs/create'], {
      queryParams: {
        asset_id: asset_ids,
      },
    });
  }

  goToEdit(mat: assetRepairsTypes) {
    this.router.navigate(['/admin/assetRepairs/update', mat.asset_id], {
      state: {
        assetItem: mat,
      },
    });
  }

  goToDetail(assetRepairs: assetRepairsTypes) {
    this.router.navigate(['/admin/assetRepairs/detail', assetRepairs.asset_repair_id], {
      state: { assetRepairs },
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
      { label: 'ครั้งที่', key: 'repair_document_no' },
      { label: 'วันที่ซ่อม', key: 'repair_date', pipe: 'thaiDate' },
      { label: 'ร้านซ่อม', key: 'repair_shop_name' },
      { label: 'ค่าใช้จ่าย', key: 'repair_cost' },
      { label: 'สถานะ', key: 'status', type: 'badge' },
    ];

  cancel() {
    const assetId = this.assetRepairs()?.[0].asset_id;

    if (!assetId) {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    this.router.navigate(['/admin/assetItems', assetId], {
      state: {
        assetItem: history.state?.assetItem,
        procurementrecord: history.state?.procurementrecord,
        procurement_record_id: history.state?.procurement_record_id,
      },
    });
  }
}
