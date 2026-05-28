import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { fundcategorysTypes } from './interface/fundcategorysTypes';
import { FundcategorysService } from './service/fundcategorys.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './fundcategorys.component.html',
})
export class FundcategorysComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private fundcategorysService = inject(FundcategorysService);
  private alertService = inject(AlertService);

  fundcategory?: Pagination<fundcategorysTypes>;
  fundcategorys = signal<fundcategorysTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getFundcategorys();
  }

  getFundcategorys() {
    this.fundcategorysService.getFundcategorys(this.table.params).subscribe({
      next: (response) => {
        this.fundcategory = response;
        this.fundcategorys.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getFundcategorys());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getFundcategorys());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getFundcategorys());
  }

  deleteFundcategorys(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.fundcategorysService.deleteFundcategorys(id).subscribe({
      next: () => this.getFundcategorys(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/fundcategorys/create']);
  }

  goToEdit(fund: fundcategorysTypes) {
    this.router.navigate(['/admin/fundcategorys/update', fund.fund_category_id], {
      state: { fund },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'รหัสหมวดเงิน', key: 'fund_code' },
    { label: 'ชื่อหมวดเงิน', key: 'fund_name' },
  ];
}
