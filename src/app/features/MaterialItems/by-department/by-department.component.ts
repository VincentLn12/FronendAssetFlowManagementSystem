import { Component, inject, OnDestroy, signal } from '@angular/core';
import { materialItemsTypes } from '../interface/materialItemsTypes';
import { Pagination } from '../../../shared/models/pagination';
import { TableState } from '../../../../shared/TableState';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialItemsService } from '../service/materialItems.service';
import { FiscalyearsService } from '../../fiscalyears/service/fiscalyears.service';
import { AlertService } from '../../../../shared.service';
import { Params } from '../../../shared/models/allType';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../departments/service/department.service';
import { DepartmentType } from '../../departments/interface/departmentType';

@Component({
  selector: 'app-by-department',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './by-department.component.html',
})
export class MaterialItemsByDepartmentComponent implements OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private table = new TableState();
  private materialItemsService = inject(MaterialItemsService);
  private fiscalyearsService = inject(FiscalyearsService);
  private alertService = inject(AlertService);
  private departmentService = inject(DepartmentService);

  departmentId = signal<number | null>(null);
  depart = signal<DepartmentType | null>(
    (history.state?.depart as DepartmentType | undefined) ?? null,
  );
  materialItem?: Pagination<materialItemsTypes>;
  materialItems = signal<materialItemsTypes[]>([]);
  fiscalYears = signal<any[]>([]);
  fiscalYearId = signal<number | null>(null);
  searchValue = '';
  loading = signal(false);
  private searchTimer?: ReturnType<typeof setTimeout>;

  Params = new Params();

  ngOnInit(): void {
    this.loadDropdowns();

    this.route.paramMap.subscribe((params) => {
      const departmentId = Number(params.get('departmentId'));

      if (!departmentId || departmentId <= 0) {
        console.error('ไม่พบ departmentId ใน URL');
        return;
      }

      this.departmentId.set(departmentId);
      this.loadDepartment(departmentId);
      this.getMaterialItems();
    });

    this.route.queryParamMap.subscribe((params) => {
      const fiscalYearIdParam = params.get('fiscalYearId') ?? params.get('fiscal_year_id');

      const fiscalYearId = fiscalYearIdParam ? Number(fiscalYearIdParam) : null;

      this.fiscalYearId.set(fiscalYearId && fiscalYearId > 0 ? fiscalYearId : null);

      if (this.departmentId()) {
        this.getMaterialItems();
      }
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

  loadDepartment(departmentId: number) {
    if (this.depart()?.department_id === departmentId) return;

    this.departmentService.getDepartment(departmentId).subscribe({
      next: (department) => this.depart.set(department),
      error: (error) => console.error(error),
    });
  }

  getMaterialItems() {
    const departmentId = this.departmentId();
    if (!departmentId) return;

    this.loading.set(true);
    this.materialItemsService
      .getMaterialItemsByDepartment(departmentId, this.fiscalYearId(), this.searchValue)
      .subscribe({
        next: (res) => this.materialItems.set(res ?? []),
        error: (err) => console.error(err),
        complete: () => this.loading.set(false),
      });
  }

  onSearch(value: string) {
    this.searchValue = value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.getMaterialItems(), 300);
  }

  clearSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchValue = '';
    this.getMaterialItems();
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getMaterialItems());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getMaterialItems());
  }

  onFiscalYearChange(value: string | number | null) {
    const fiscalYearId = value ? Number(value) : null;

    this.fiscalYearId.set(fiscalYearId && fiscalYearId > 0 ? fiscalYearId : null);

    this.table.params.pageNumber = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { fiscalYearId: null, fiscal_year_id: fiscalYearId && fiscalYearId > 0 ? fiscalYearId : null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
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

  goTOStockCard(id: number) {
    const materialItem = this.materialItems().find((item) => item.material_item_id === id);

    const fiscalYearId = this.fiscalYearId();
    const departmentId = this.departmentId();

    this.router.navigate(['/admin/MaterialStockCard', id], {
      queryParams: {
        ...(fiscalYearId && fiscalYearId > 0 ? { fiscal_year_id: fiscalYearId } : {}),
        ...(departmentId && departmentId > 0 ? { department_id: departmentId } : {}),
      },
      state: {
        materialItems: materialItem,
      },
    });
  }

  goToIssue(item: materialItemsTypes) {
    const departmentId = this.departmentId();
    if (!departmentId) return;

    this.router.navigate(
      ['/admin/MaterialIssueDetail/create/department', departmentId, item.material_item_id],
      {
        state: {
          materialItem: item,
          fromMaterialItems: true,
          department_id: departmentId,
          depart: this.depart(),
        },
      },
    );
  }

  goToIssueMany() {
    const departmentId = this.departmentId();
    if (!departmentId) return;

    this.router.navigate(['/admin/MaterialIssueDetail/create/department', departmentId], {
      state: {
        fromMaterialItems: true,
        department_id: departmentId,
        depart: this.depart(),
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
