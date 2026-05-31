import { Component, OnInit, inject, signal, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { AlertService } from '../../../shared.service';
import { assetSubItemTypes } from './interface/assetsubItemsTypes';
import { AssetSubItemsService } from './service/assetsubItem.service';
import { TableState } from '../../../shared/TableState';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './assetsubItem.component.html',
})
export class AssetSubItemsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetSubItemsService = inject(AssetSubItemsService);
  private alertService = inject(AlertService);
  private table = new TableState();

  asset_id = signal<number | null>(null);

  assetsubItem?: Pagination<assetSubItemTypes>;
  assetsubItems = signal<assetSubItemTypes[]>([]);

  Params = new Params();
  totalCount = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.asset_id.set(id);
      this.LoadgetAssetSubItems(id);
    }
  }

  LoadgetAssetSubItems(id: number) {
    this.assetSubItemsService.getAssetSubItemsbyProcuremen(this.table.params, id).subscribe({
      next: (response) => {
        this.assetsubItems.set(response.data);
        this.totalCount.set(response.count);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSearch(value, () => this.LoadgetAssetSubItems(id));
  }

  onPageChange(page: number) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onPageChange(page, () => this.LoadgetAssetSubItems(id));
  }

  onSort(value: string) {
    const id = this.asset_id();

    if (!id) return;

    this.table.onSort(value, () => this.LoadgetAssetSubItems(id));
  }

  deleteAssetSubItems(id: number) {
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

    this.assetSubItemsService.deleteAssetSubItems(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบรายการเรียบร้อยแล้ว');
        this.LoadgetAssetSubItems(procurementId);
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    const asset_id = this.asset_id();

    if (!asset_id) return;

    this.router.navigate(['/admin/assetsubItems/create'], {
      queryParams: {
        asset_id: asset_id,
      },
    });
  }

  goToEdit(assetSubItem: assetSubItemTypes) {
    this.router.navigate(['/admin/assetsubItems/update', assetSubItem.asset_sub_item_id], {
      state: {
        assetItem: assetSubItem,
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
      { label: 'รหัสเริ่มต้น', key: 'asset_code_start' },
      { label: 'รหัสสิ้นสุด', key: 'asset_code_end' },
      { label: 'ชื่อคุรุภัณฑ์ย่อย', key: 'sub_item_name' },
      { label: 'หมวดหมู่', key: 'category_name' },
      { label: 'ราคา', key: 'unit_price' },
      { label: 'จำนวน', key: 'quantity_with_unit' },
      { label: 'ราคารวม', key: 'total_price' },
    ];
}
