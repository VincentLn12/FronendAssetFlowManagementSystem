import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { expenseTypes } from './interface/expenseTypes';
import { ExpensetypesService } from './service/expenseTypes.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './expensetypes.component.html',
})
export class ExpensetypesComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private expensetypesTypesServive = inject(ExpensetypesService);
  private alertService = inject(AlertService);

  expensetype?: Pagination<expenseTypes>;
  expensetypes = signal<expenseTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getExpensetypesTypes();
  }

  getExpensetypesTypes() {
    this.expensetypesTypesServive.getExpenseTypes(this.table.params).subscribe({
      next: (response) => {
        this.expensetype = response;
        this.expensetypes.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getExpensetypesTypes());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getExpensetypesTypes());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getExpensetypesTypes());
  }

  deleteExpensetypesTypes(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.expensetypesTypesServive.deleteExpenseTypes(id).subscribe({
      next: () => this.getExpensetypesTypes(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/expensetypes/create']);
  }

  goToEdit(expenseTypes: expenseTypes) {
    this.router.navigate(['/admin/expensetypes/update', expenseTypes.expense_type_id], {
      state: { expenseTypes },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อประเภทการเบิกจ่าย', key: 'expense_type_name' },
  ];
}
