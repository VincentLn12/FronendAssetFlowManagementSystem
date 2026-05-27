import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { RolesService } from './service/roles.service';
import { roleType } from './interface/roleType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private rolesServive = inject(RolesService);
  private alertService = inject(AlertService);

  role?: Pagination<roleType>;
  roles = signal<roleType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getRoles();
  }

  getRoles() {
    this.rolesServive.getRoles(this.table.params).subscribe({
      next: (response) => {
        this.role = response;
        this.roles.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getRoles());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getRoles());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getRoles());
  }

  deleteRoles(id: string, event?: MouseEvent) {
    event?.stopPropagation();

    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบบทบาทนี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }

  confirmDelete(id: string) {
    this.rolesServive.deleteRoles(id).subscribe({
      next: () => {
        this.alertService.successNo('ลบบทบาทเรียบร้อยแล้ว');
        this.getRoles();
      },
      error: (error) => {
        console.error(error);
        this.alertService.error('ลบข้อมูลไม่สำเร็จ', 'เกิดข้อผิดพลาดในการลบบทบาทนี้');
      },
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/roles/create']);
  }

  goToEdit(roles: roleType) {
    this.router.navigate(['/admin/roles/update', roles.id], {
      state: { roles },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อโรล', key: 'name' },
  ];
}
