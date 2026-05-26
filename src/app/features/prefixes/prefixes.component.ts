import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { PrefixesService } from './service/prefixes.service';
import { prefixesType } from './interface/prefixesType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './prefixes.component.html',
})
export class PrefixesComponent implements OnInit {
  private router = inject(Router);
  private table = new TableState();
  private profixesService = inject(PrefixesService);

  prefix?: Pagination<prefixesType>;
  prefixs = signal<prefixesType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getPrefixes();
  }

  getPrefixes() {
    this.profixesService.getPrefixes(this.table.params).subscribe({
      next: (response) => {
        this.prefix = response;
        this.prefixs.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getPrefixes());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getPrefixes());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getPrefixes());
  }

  deletePrefixes(id: number) {
    this.profixesService.deletePrefixes(id).subscribe({
      next: () => this.getPrefixes(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/prefixes/create']);
  }

  goToEdit(prefixes: prefixesType) {
    this.router.navigate(['/admin/prefixes/update', prefixes.prefix_id], {
      state: { prefixes },
    });
  }

  sortOptions = [
    { label: 'ชื่อ A-Z', value: 'nameAsc' },
    { label: 'ชื่อ Z-A', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ID', key: 'prefix_id' },
    { label: 'คำนำหน้าเต็ม', key: 'prefix_name' },
    { label: 'คำนำหน้าสั้น', key: 'prefix_short_name' },
  ];
}
