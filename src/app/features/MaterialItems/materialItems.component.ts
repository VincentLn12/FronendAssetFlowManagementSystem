import { FiscalyearsService } from './../fiscalyears/service/fiscalyears.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { materialItemsTypes } from './interface/materialItemsTypes';
import { MaterialItemsService } from './service/materialItems.service';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableAction } from '../../../shared/data-table/data-table.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [FormsModule, DataTableComponent],
  templateUrl: './materialItems.component.html',
})
export class MaterialItemsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private table = new TableState();
  private materialItemsService = inject(MaterialItemsService);
  private fiscalyearsService = inject(FiscalyearsService);
  private alertService = inject(AlertService);

  materialItem?: Pagination<materialItemsTypes>;
  materialItems = signal<materialItemsTypes[]>([]);
  fiscalYears = signal<any[]>([]);
  fiscalYearId = signal<number | null>(null);
  searchValue = '';

  Params = new Params();

  ngOnInit(): void {
    this.loadDropdowns();

    this.route.queryParamMap.subscribe((params) => {
      const fiscalYearIdParam = params.get('fiscalYearId') ?? params.get('fiscal_year_id');

      const fiscalYearId = fiscalYearIdParam ? Number(fiscalYearIdParam) : null;

      this.fiscalYearId.set(
        fiscalYearId && Number.isFinite(fiscalYearId) && fiscalYearId > 0 ? fiscalYearId : null,
      );

      this.getMaterialItems();
    });
  }

  loadDropdowns() {
    const params = new Params();
    params.pageSize = 100;
    params.pageNumber = 1;

    this.fiscalyearsService.getFiscalyears(params).subscribe({
      next: (res) => this.fiscalYears.set(res.data),
      error: (error) => console.error(error),
    });
  }

  getMaterialItems() {
    this.materialItemsService
      .getMaterialItems({
        ...this.table.params,
        fiscalYearId: this.fiscalYearId(),
      })
      .subscribe({
        next: (response) => {
          this.materialItem = response;
          this.materialItems.set(response.data ?? []);
        },
        error: (error) => console.error(error),
      });
  }

  copyMaterialItem(id: number) {
    this.alertService.confirm('คัดลอกข้อมูล', 'คุณต้องการคัดลอกวัสดุนี้หรือไม่?').then((result) => {
      if (!result.isConfirmed) return;

      this.materialItemsService.copyMaterialItems(id).subscribe({
        next: () => {
          this.getMaterialItems();
          this.alertService.successNo('คัดลอกวัสดุสำเร็จ');
        },
        error: (err) => {
          console.error(err);
          this.alertService.error('คัดลอกวัสดุไม่สำเร็จ', '');
        },
      });
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getMaterialItems());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getMaterialItems());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getMaterialItems());
  }

  onTableAction(event: TableAction) {
    if (event.type === 'copy') {
      this.copyMaterialItem(event.item.material_item_id);
    }
  }

  deleteMaterialItems(id: number) {
    this.alertService.confirm('ยืนยันการลบ', 'คุณต้องการลบหรือไม่?').then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(id);
        this.alertService.successNo('ลบเรียบร้อยแล้ว');
      }
    });
  }

  confirmDelete(id: number) {
    this.materialItemsService.deleteMaterialItems(id).subscribe({
      next: () => this.getMaterialItems(),
      error: (error) => console.error(error),
    });
  }

  goToCreate() {
    this.router.navigate(['/admin/MaterialItems/create'], {
      state: {
        fiscalYearId: this.fiscalYearId(),
      },
    });
  }

  goToEdit(mat: materialItemsTypes) {
    this.router.navigate(['/admin/MaterialItems/update', mat.material_item_id], {
      state: { mat },
    });
  }

  headerColor = 'bg-green-800';
  headerBorderColor = 'border-green-800';
  butttonColor = 'bg-green-800 hover:bg-green-900 ';

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'รหัสวัสดุ', key: 'material_code' },
    { label: 'ชื่อวัสดุ', key: 'material_name' },
    { label: 'ราคา', key: 'unit_price' },
    { label: 'หน่วยนับ', key: 'unit_name' },
  ];
}
