import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { assetUsageType } from './interface/assetUsageType';
import { AssetUsageTypeService } from './service/assetUsageType.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './assetUsageType.component.html',
})
export class AssetUsageTypeComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private AssetUsageTypeService = inject(AssetUsageTypeService);
  private alertService = inject(AlertService);

  assetUsageType?: Pagination<assetUsageType>;
  assetUsageTypes = signal<assetUsageType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getassetUsageType();
  }

  getassetUsageType() {
    this.AssetUsageTypeService.getAssetUsageTypes(this.table.params).subscribe({
      next: (response) => {
        this.assetUsageType = response;
        this.assetUsageTypes.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getassetUsageType());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getassetUsageType());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getassetUsageType());
  }

  deleteassetUsageType(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.AssetUsageTypeService.deleteAssetUsageTypes(id).subscribe({
      next: () => this.getassetUsageType(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/assetUsageType/create']);
  }

  goToEdit(assetUsageType: assetUsageType) {
    this.router.navigate(['/admin/assetUsageType/update', assetUsageType.usage_type_id], {
      state: { assetUsageType },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อประเภทการใช้งาน', key: 'usage_type_name' },
  ];
}
