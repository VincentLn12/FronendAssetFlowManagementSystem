import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { StaffsService } from './service/staffsType.service';
import { staffsType, staffsTypeCreate } from './interface/staffsType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './staffs.component.html',
})
export class StaffsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private staffsService = inject(StaffsService);
  private alertService = inject(AlertService);

  staff?: Pagination<staffsType>;
  staffs = signal<staffsType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getStaffs();
  }

  getStaffs() {
    this.staffsService.getStaffs(this.table.params).subscribe({
      next: (response) => {
        this.staff = response;
        this.staffs.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getStaffs());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getStaffs());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getStaffs());
  }

  deletePrefixes(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.staffsService.deleteStaff(id).subscribe({
      next: () => this.getStaffs(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/staffs/create']);
  }

  goToEdit(staff: staffsTypeCreate) {
    this.router.navigate(['/admin/staffs/update', staff.staff_id], {
      state: { staff },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: {
    label: string;
    key: string;
    type?: 'text' | 'price' | 'badge';
    transform?: (value: any, item?: any) => any;
  }[] = [
    {
      label: 'ชื่อ-นามสกุล',
      key: 'full_name',
    },
    { label: 'อีเมล', key: 'email' },
    { label: 'เบอร์โทรศัพท์', key: 'phone' },
    { label: 'สาขาวิชา', key: 'department_name' },
    { label: 'ตำเเหน่ง', key: 'position_name' },
  ];
}
