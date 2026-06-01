import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { AssetCategoriesTypes } from './interface/AssetCategoriesTypes';
import { AssetCategoriesService } from './service/assetCategories.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './assetCategories.component.html',
})
export class AssetCategoriesComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private assetCategoriesService = inject(AssetCategoriesService);
  private alertService = inject(AlertService);

  assetCategorie?: Pagination<AssetCategoriesTypes>;
  assetCategories = signal<AssetCategoriesTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getAssetCategories();
  }

  getAssetCategories() {
    this.assetCategoriesService.getAssetCategories(this.table.params).subscribe({
      next: (response) => {
        this.assetCategorie = response;
        this.assetCategories.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getAssetCategories());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getAssetCategories());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getAssetCategories());
  }

  deleteAssetCategories(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.assetCategoriesService.deleteAssetCategories(id).subscribe({
      next: () => this.getAssetCategories(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/assetCategorie/create']);
  }

  goToEdit(assetCategories: AssetCategoriesTypes) {
    this.router.navigate(['/admin/assetCategorie/update', assetCategories.asset_category_id], {
      state: { assetCategories  },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อประเภทครุภัณฑ์หลัก', key: 'category_name' },
  ];
}
