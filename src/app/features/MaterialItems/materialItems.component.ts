import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { materialItemsTypes } from './interface/materialItemsTypes';
import { MaterialItemsService } from './service/materialItems.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './materialItems.component.html',
})
export class MaterialItemsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private materialItemsService = inject(MaterialItemsService);
  private alertService = inject(AlertService);

  materialItem?: Pagination<materialItemsTypes>;
  materialItems = signal<materialItemsTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getMaterialItems();
  }

  getMaterialItems() {
    this.materialItemsService.getMaterialItems(this.table.params).subscribe({
      next: (response) => {
        this.materialItem = response;
        this.materialItems.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getMaterialItems());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getMaterialItems());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getMaterialItems());
  }

  deleteMaterialItems(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.materialItemsService.deleteMaterialItems(id).subscribe({
      next: () => this.getMaterialItems(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/MaterialItems/create']);
  }

  goToEdit(mat: materialItemsTypes) {
    this.router.navigate(['/admin/MaterialItems/update', mat.unit_id], {
      state: { mat },
    });
  }
  getTotalAmount() {
    return this.materialItems().reduce((sum, item) => {
      return sum + Number(item.total_amount ?? 0);
    }, 0);
  }
}
