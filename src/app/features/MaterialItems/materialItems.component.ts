import { FiscalyearsService } from './../fiscalyears/service/fiscalyears.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { AlertService } from '../../../shared.service';
import { materialItemsTypes } from './interface/materialItemsTypes';
import { MaterialItemsService } from './service/materialItems.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
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

      if (fiscalYearId && Number.isFinite(fiscalYearId)) {
        this.fiscalYearId.set(fiscalYearId);
      } else {
        this.fiscalYearId.set((history.state?.fiscalYearId as number | null) ?? null);
      }

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
          this.materialItems.set(response.data);
        },
        error: (error) => console.error(error),
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

  onFiscalYearChange(value: string | number | null) {
    this.fiscalYearId.set(value ? Number(value) : null);
    this.table.params.pageNumber = 1;
    this.getMaterialItems();
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

  goTOStockCard(id: number) {
    this.router.navigate(['/admin/MaterialStockCard', id], {
      state: { materialItems: this.materialItems().find((item) => item.material_item_id === id) },
    });
  }

  goToIssue(item: materialItemsTypes) {
    this.router.navigate(['/admin/MaterialIssueDetail/create', item.material_item_id], {
      state: {
        materialItem: item,
        fromMaterialItems: true,
      },
    });
  }

  goToIssueMany() {
    this.router.navigate(['/admin/MaterialIssueDetail/create'], {
      state: {
        fromMaterialItems: true,
      },
    });
  }

  getCurrentFiscalYearLabel() {
    return (
      this.fiscalYears().find((year) => year.fiscal_year_id === this.fiscalYearId())?.fiscal_year ??
      'ทุกปีงบประมาณ'
    );
  }

  getVisibleItemCount() {
    return this.materialItems().length;
  }

  getTotalBalance() {
    return this.materialItems().reduce((sum, item) => {
      return sum + Number(item.current_balance ?? 0);
    }, 0);
  }

  getTotalAmount() {
    return this.materialItems().reduce((sum, item) => {
      return sum + Number(item.total_amount ?? 0);
    }, 0);
  }
}
