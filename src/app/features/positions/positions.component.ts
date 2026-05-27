import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { PositionsService } from './service/positions.service';
import { positionsType } from './interface/positionsType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './positions.component.html',
})
export class PositionsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private prositionsServive = inject(PositionsService);
  private alertService = inject(AlertService);

  position?: Pagination<positionsType>;
  positions = signal<positionsType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getPositons();
  }

  getPositons() {
    this.prositionsServive.getPositions(this.table.params).subscribe({
      next: (response) => {
        this.position = response;
        this.positions.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getPositons());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getPositons());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getPositons());
  }

  deletePosition(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      }
    });
  }
  confirmDelete(id: number) {
    this.prositionsServive.deletePositions(id).subscribe({
      next: () => this.getPositons(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/positions/create']);
  }

  goToEdit(positions: positionsType) {
    this.router.navigate(['/admin/positions/update', positions.position_id], {
      state: { positions },
    });
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อตำเเหน่ง', key: 'position_name' },
  ];
}
