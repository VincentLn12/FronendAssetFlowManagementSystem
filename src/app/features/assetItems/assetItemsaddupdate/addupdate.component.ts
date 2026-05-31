import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { assetItemsCreateTypes } from '../interface/assetItemsTypes';
import { AssetItemsService } from '../service/assetItems.service';
import { DepartmentService } from '../../departments/service/department.service';
import { VendorsService } from '../../vendors/service/vendors.service';
import { FundcategorysService } from '../../fundcategorys/service/fundcategorys.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { AssetCategoriesService } from '../../assetCategories/service/assetCategories.service';
import { MaterialUnitsService } from '../../materialUnits/service/materialUnits.service';
import { SelectComponent } from '../../../../shared';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';

@Component({
  selector: 'app-asset-items-addupdate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
  ],
  templateUrl: './addupdate.component.html',
})
export class AssetItemsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetItemsService = inject(AssetItemsService);
  private snackbar = inject(SnackbarService);

  asset_id = signal<number | null>(null);
  isEditMode = computed(() => this.asset_id() !== null);

  name = 'ครุภัณฑ์';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  //loaddropdown
  private departmentService = inject(DepartmentService);
  private vendorsService = inject(VendorsService);
  private fundcategorysService = inject(FundcategorysService);
  private staffsService = inject(StaffsService);
  private assetCategoriesService = inject(AssetCategoriesService);
  private materialUnitsService = inject(MaterialUnitsService);

  asset_category = signal<any[]>([]);
  staffs = signal<any[]>([]);
  unit = signal<any[]>([]);
  departments = signal<any[]>([]);
  vendors = signal<any[]>([]);
  fund_categorys = signal<any[]>([]);

  form = this.fb.group({
    asset_id: [null as number | null],
    procurement_record_id: [null as number | null, [Validators.required]],
    item_no: [0],
    asset_code_prefix: ['', [Validators.required]],
    asset_name: ['', [Validators.required]],
    receive_date: [new Date().toISOString().split('T')[0], [Validators.required]],
    fund_category_id: [null as number | null, [Validators.required]],
    department_id: [null as number | null, [Validators.required]],
    staff_id: [null as number | null, [Validators.required]],
    vendor_id: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.asset_id.set(id);
      this.loadAssetItem(id);
    }

    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');
    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.form.patchValue({
        procurement_record_id: procurementRecordId,
      });
    }
  }

  private loadAssetItem(id: number) {
    const stateAssetItem = history.state?.assetItem as assetItemsCreateTypes | undefined;

    if (stateAssetItem?.asset_id === id) {
      this.patchForm(stateAssetItem);
      return;
    }

    this.isLoading.set(true);

    this.assetItemsService
      .getAssetItem(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (item) => this.patchForm(item),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/assetItems']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      assetCategories: this.assetCategoriesService.getAssetCategories({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      staff: this.staffsService.getStaffs({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      unit: this.materialUnitsService.getMaterialUnits({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      department: this.departmentService.getDepartments({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      vendor: this.vendorsService.getVendors({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      fund_category: this.fundcategorysService.getFundcategorys({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.asset_category.set(res.assetCategories.data);
        this.staffs.set(res.staff.data);
        this.unit.set(res.unit.data);
        this.departments.set(res.department.data);
        this.vendors.set(res.vendor.data);
        this.fund_categorys.set(res.fund_category.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private patchForm(item: assetItemsCreateTypes) {
    this.form.patchValue({
      asset_id: item.asset_id ?? null,
      procurement_record_id: item.procurement_record_id ?? null,
      item_no: item.item_no ?? 0,
      asset_code_prefix: item.asset_code_prefix ?? '',
      asset_name: item.asset_name ?? '',
      receive_date: item.receive_date ?? '',
      fund_category_id: item.fund_category_id ?? null,
      department_id: item.department_id ?? null,
      staff_id: item.staff_id ?? null,
      vendor_id: item.vendor_id ?? null,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<assetItemsCreateTypes> = {
      asset_id: this.asset_id(),
      procurement_record_id: this.form.controls.procurement_record_id.value,
      item_no: this.form.controls.item_no.value ?? 0,
      asset_code_prefix: this.form.controls.asset_code_prefix.value?.trim() ?? '',
      asset_name: this.form.controls.asset_name.value?.trim() ?? '',
      receive_date: this.form.controls.receive_date.value ?? '',
      fund_category_id: this.form.controls.fund_category_id.value,
      department_id: this.form.controls.department_id.value,
      staff_id: this.form.controls.staff_id.value,
      vendor_id: this.form.controls.vendor_id.value,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetItemsService.updateAssetItems(this.asset_id()!, payload)
      : this.assetItemsService.createAssetItems(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        const procurementRecordId = this.form.controls.procurement_record_id.value;

        this.router.navigate(['/admin/assetItems', procurementRecordId]);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const procurementRecordId = this.form.controls.procurement_record_id.value;

    this.router.navigate(['/admin/assetItems', procurementRecordId]);
  }
}
