import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { budgetsourceTypes } from './interface/budgetsourceTypes';
import { BudgetsourceService } from './service/budgetSource.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './budgetsources.component.html',
})
export class BudgetsourcesComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private budgetsourceService = inject(BudgetsourceService);
  private alertService = inject(AlertService);

  budgetsource?: Pagination<budgetsourceTypes>;
  budgetsources = signal<budgetsourceTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getBudgetsource();
  }

  getBudgetsource() {
    this.budgetsourceService.getBudgetsources(this.table.params).subscribe({
      next: (response) => {
        this.budgetsource = response;
        this.budgetsources.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getBudgetsource());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getBudgetsource());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getBudgetsource());
  }

  deleteBudgetsource(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.budgetsourceService.deleteBudgetsources(id).subscribe({
      next: () => this.getBudgetsource(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/budgetsources/create']);
  }

  goToEdit(butg: budgetsourceTypes) {
    this.router.navigate(['/admin/budgetsources/update', butg.budget_source_id], {
      state: { butg },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อเเหล่งงบประมาณ', key: 'budget_source_name' },
  ];
}
