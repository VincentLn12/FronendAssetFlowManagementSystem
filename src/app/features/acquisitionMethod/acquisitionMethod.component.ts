import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { acquisitionMethodTypes } from './interface/acquisitionMethodTypes';
import { AcquisitionMethodService } from './service/acquisitionMethod.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './acquisitionMethod.component.html',
})
export class AcquisitionMethodComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private acquisitionMethodService = inject(AcquisitionMethodService);
  private alertService = inject(AlertService);

  AcquisitionMethod?: Pagination<acquisitionMethodTypes>;
  AcquisitionMethods = signal<acquisitionMethodTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getAcquisitionMethod();
  }

  getAcquisitionMethod() {
    this.acquisitionMethodService.getAcquisitionMethods(this.table.params).subscribe({
      next: (response) => {
        this.AcquisitionMethod = response;
        this.AcquisitionMethods.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getAcquisitionMethod());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getAcquisitionMethod());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getAcquisitionMethod());
  }

  deleteAcquisitionMethod(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.acquisitionMethodService.deleteAcquisitionMethod(id).subscribe({
      next: () => this.getAcquisitionMethod(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/acquisitionMethod/create']);
  }

  goToEdit(AcquisitionMethod: acquisitionMethodTypes) {
    this.router.navigate(
      ['/admin/acquisitionMethod/update', AcquisitionMethod.acquisition_method_id],
      {
        state: { AcquisitionMethod },
      },
    );
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อวิธีการได้มา', key: 'acquisition_method_name' },
  ];
}
