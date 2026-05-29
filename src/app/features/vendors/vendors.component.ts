import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { vendorsTypes } from './interface/vendorsTypes';
import { VendorsService } from './service/vendors.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './vendors.component.html',
})
export class VendorsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private vendorsService = inject(VendorsService);
  private alertService = inject(AlertService);

  vendor?: Pagination<vendorsTypes>;
  vendors = signal<vendorsTypes[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getVendors();
  }

  getVendors() {
    this.vendorsService.getVendors(this.table.params).subscribe({
      next: (response) => {
        this.vendor = response;
        this.vendors.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getVendors());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getVendors());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getVendors());
  }

  deleteVendors(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.vendorsService.deleteVendors(id).subscribe({
      next: () => this.getVendors(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/vendors/create']);
  }

  goToEdit(vendors: vendorsTypes) {
    this.router.navigate(['/admin/vendors/update', vendors.vendor_id], {
      state: { vendors },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'เลขผู้เสียภาษี', key: 'tax_no' },
    { label: 'ชื่อร้านค้า', key: 'vendor_name' },
    { label: 'เบอร์โทรศัพท์', key: 'phone' },
    { label: 'ชื่อผู้ติดต่อ', key: 'contact_name' },
  ];
}
