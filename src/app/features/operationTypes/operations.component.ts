import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { OperationTypes } from './interface/operationTypes';
import { OperationsTypeService } from './service/operationTypes.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './operations.component.html',
})
export class OperationsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private operationTypesServive = inject(OperationsTypeService);
  private alertService = inject(AlertService);

  operation?: Pagination<OperationTypes>;
  operations = signal<OperationTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getOperationTypes();
  }

  getOperationTypes() {
    this.operationTypesServive.getOperationtypes(this.table.params).subscribe({
      next: (response) => {
        this.operation = response;
        this.operations.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getOperationTypes());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getOperationTypes());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getOperationTypes());
  }

  deleteOperationTypes(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.operationTypesServive.deleteOperationtypes(id).subscribe({
      next: () => this.getOperationTypes(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/OperationTypes/create']);
  }

  goToEdit(op: OperationTypes) {
    this.router.navigate(['/admin/OperationTypes/update', op.operation_type_id], {
      state: { op },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อประเภทการดำเนินงาน', key: 'operation_type_name' },
  ];
}
