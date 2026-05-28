import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { FiscalyearsService } from './service/fiscalyears.service';
import { fiscalyearsType } from './interface/fiscalyearsType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './fiscalyears.component.html',
})
export class FiscalyearsComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private fiscalyearsServive = inject(FiscalyearsService);
  private alertService = inject(AlertService);

  fiscalyear?: Pagination<fiscalyearsType>;
  fiscalyears = signal<fiscalyearsType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getFiscalyears();
  }

  getFiscalyears() {
    this.fiscalyearsServive.getFiscalyears(this.table.params).subscribe({
      next: (response) => {
        this.fiscalyear = response;
        this.fiscalyears.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getFiscalyears());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getFiscalyears());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getFiscalyears());
  }

  deleteFiscalyears(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบคำนำหน้านี้หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
      }
    });
  }
  confirmDelete(id: number) {
    this.fiscalyearsServive.deleteFiscalyears(id).subscribe({
      next: () => {
        this.getFiscalyears();
        this.alertService.successNo('ลบคำนำหน้านี้เรียบร้อยแล้ว');
      },
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/fiscalyears/create']);
  }

  goToEdit(year: fiscalyearsType) {
    this.router.navigate(['/admin/fiscalyears/update', year.fiscal_year_id], {
      state: { year },
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
    pipe?: 'thaiDate';
  }[] = [
    { label: 'ปีงบประมาณ', key: 'fiscal_year' },

    { label: 'ชื่อปี', key: 'year_name' },

    {
      label: 'วันที่เริ่มต้น',
      key: 'start_date',
      pipe: 'thaiDate',
    },

    {
      label: 'วันที่สิ้นสุด',
      key: 'end_date',
      pipe: 'thaiDate',
    },
  ];
}
