import { FiscalyearsService } from './../../fiscalyears/service/fiscalyears.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MaterialIssueDetailTypes } from '../interface/materialIssueDetailTypes';
import { MaterialIssueDetailService } from '../service/materialIssueDetailDetail.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { SelectComponent, TextareaComponent } from '../../../../shared';
import { MaterialItemsService } from '../../MaterialItems/service/materialItems.service';
import { materialItemsTypes } from '../../MaterialItems/interface/materialItemsTypes';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';
import { staffsType } from '../../staffs/interface/staffsType';
import { ProcurementrecordService } from '../../procurementrecord/service/procurementrecord.service';

@Component({
  selector: 'app-material-issue-detail-addupdate',
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
export class MaterialIssueDetailAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialIssueDetailService = inject(MaterialIssueDetailService);
  private snackbar = inject(SnackbarService);
  private staffsService = inject(StaffsService);
  private materialItemsService = inject(MaterialItemsService);
  private procurementrecordService = inject(ProcurementrecordService);

  issue_detail_id = signal<number | null>(null);
  isEditMode = computed(() => this.issue_detail_id() !== null);

  name = 'รายละเอียดการจ่ายวัสดุ';
  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  procurementrecord = history.state?.procurementrecord;
  materialItem = history.state?.materialItem as materialItemsTypes | undefined;
  fromMaterialItems = history.state?.fromMaterialItems === true;
  departmentIdFromState = history.state?.department_id as number | undefined;
  materialitems = signal<any[]>([]);
  staffs = signal<any[]>([]);

  form = this.fb.group({
    issue_detail_id: [0],
    procurement_record_id: [null as number | null, Validators.required],
    material_item_id: [null as number | null, Validators.required],
    staff_id: [this.procurementrecord?.staff_id ?? null, Validators.required],
    issue_date: [this.toDateInputValue(new Date()), Validators.required],
    quantity: [0, Validators.required],
    unit_price: [0, Validators.required],
    total_amount: [0],
    remark: [''],
  });

  createForm = this.fb.group({
    procurement_record_id: [null as number | null, Validators.required],
    staff_id: [this.procurementrecord?.staff_id ?? null, Validators.required],
    issue_date: [''],
    items: this.fb.array<FormGroup>([]),
  });

  private toDateInputValue(date: Date | string | null | undefined): string {
    if (!date) return '';

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return '';

    return d.toISOString().slice(0, 10);
  }

  get itemForms() {
    return this.items.controls;
  }

  get items() {
    return this.createForm.controls.items as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');
    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;
    const departmentIdParam = this.route.snapshot.paramMap.get('departmentId');
    const departmentId = departmentIdParam ? Number(departmentIdParam) : null;

    if (id && Number.isFinite(id)) {
      this.loadDropdowns();
      this.issue_detail_id.set(id);
      this.loadMaterialIssueDetail(id);
      return;
    }

    if (this.fromMaterialItems) {
      this.createForm.controls.procurement_record_id.clearValidators();
      this.createForm.controls.procurement_record_id.updateValueAndValidity({ emitEvent: false });
    }

    this.applyCreateRouteParams();

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.loadProcurementRecordAndDropdowns(procurementRecordId);
      return;
    }

    if (departmentId && Number.isFinite(departmentId) && !this.procurementrecord?.department_id) {
      this.procurementrecord = {
        ...this.procurementrecord,
        department_id: departmentId,
      };
    } else if (this.departmentIdFromState && !this.procurementrecord?.department_id) {
      this.procurementrecord = {
        ...this.procurementrecord,
        department_id: this.departmentIdFromState,
      };
    }

    this.loadDropdowns();
    if (this.items.length === 0) {
      this.addItem(this.materialItem?.material_item_id ?? null);
    }
  }

  private applyCreateRouteParams() {
    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');
    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;
    const materialItemIdParam = this.route.snapshot.paramMap.get('material_item_id');
    const materialItemId = materialItemIdParam ? Number(materialItemIdParam) : null;

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.createForm.patchValue({
        procurement_record_id: procurementRecordId,
      });
    }

    if (materialItemId && Number.isFinite(materialItemId) && this.items.length === 0) {
      this.addItem(materialItemId);
    }
  }

  private createItemGroup(material_item_id: number | null = null) {
    const group = this.fb.group({
      material_item_id: [material_item_id, Validators.required],
      quantity: [0, Validators.required],
      unit_price: [0, Validators.required],
      total_amount: [0],
      remark: [''],
    });

    group.controls.material_item_id.valueChanges.subscribe((id) => {
      const selectedItem = this.materialitems().find((x) => x.material_item_id === Number(id));
      if (!selectedItem) return;

      group.patchValue(
        {
          unit_price: Number(selectedItem.unit_price ?? 0),
          total_amount:
            Number(group.controls.quantity.value ?? 0) * Number(selectedItem.unit_price ?? 0),
        },
        { emitEvent: false },
      );
    });

    group.controls.quantity.valueChanges.subscribe((qty) => {
      const unitPrice = Number(group.controls.unit_price.value ?? 0);
      group.patchValue(
        {
          total_amount: Number(qty ?? 0) * unitPrice,
        },
        { emitEvent: false },
      );
    });

    if (material_item_id) {
      const selectedItem = this.materialitems().find(
        (x) => x.material_item_id === material_item_id,
      );
      if (selectedItem) {
        group.patchValue(
          {
            unit_price: Number(selectedItem.unit_price ?? 0),
          },
          { emitEvent: false },
        );
      }
    }

    return group;
  }

  addItem(material_item_id: number | null = null) {
    this.items.push(this.createItemGroup(material_item_id));
  }

  removeItem(index: number) {
    if (this.items.length <= 1) return;
    this.items.removeAt(index);
  }

  private loadMaterialIssueDetail(id: number) {
    const stateMaterialIssueDetail = history.state?.materialIssueDetail as
      | MaterialIssueDetailTypes
      | undefined;

    if (stateMaterialIssueDetail?.issue_detail_id === id) {
      this.patchForm(stateMaterialIssueDetail);
      return;
    }

    this.isLoading.set(true);

    this.materialIssueDetailService
      .getMaterialIssueDetail(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (item) => this.patchForm(item),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/MaterialIssueDetail']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      materialItems: this.materialItemsService.getMaterialItems({
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
    }).subscribe({
      next: (res) => {
        const items = res.materialItems.data.map((x: any) => ({
          ...x,
          display_name: `${x.material_code} - ${x.material_name} ราคา ${x.unit_price ?? 0} บาท`,
        }));

        this.materialitems.set(items);
        this.staffs.set(this.filterEligibleStaffs(res.staff.data));

        if (!this.isEditMode() && this.items.length > 0) {
          this.items.controls.forEach((group) => {
            const materialItemId = Number(group.get('material_item_id')?.value ?? 0);
            const selectedItem = items.find((x: any) => x.material_item_id === materialItemId);
            if (!selectedItem) return;

            group.patchValue(
              {
                unit_price: Number(selectedItem.unit_price ?? 0),
                total_amount:
                  Number(group.get('quantity')?.value ?? 0) * Number(selectedItem.unit_price ?? 0),
              },
              { emitEvent: false },
            );
          });
        }
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private loadProcurementRecordAndDropdowns(procurementRecordId: number) {
    this.procurementrecordService.getProcurementrecord(procurementRecordId).subscribe({
      next: (record) => {
        this.procurementrecord = record;
        this.createForm.patchValue({
          procurement_record_id: record.procurement_record_id,
        });
        this.loadDropdowns();

        if (this.items.length === 0) {
          this.addItem(this.materialItem?.material_item_id ?? null);
        }
      },
      error: () => {
        this.loadDropdowns();

        if (this.items.length === 0) {
          this.addItem(this.materialItem?.material_item_id ?? null);
        }
      },
    });
  }

  private filterEligibleStaffs(staffs: staffsType[]) {
    const departmentId = this.procurementrecord?.department_id;

    return staffs.filter((staff) => (departmentId ? staff.department_id === departmentId : true));
  }

  private patchForm(item: MaterialIssueDetailTypes) {
    this.form.patchValue({
      issue_detail_id: item.issue_detail_id ?? 0,
      procurement_record_id: item.procurement_record_id ?? null,
      material_item_id: item.material_item_id ?? null,
      staff_id: item.staff_id ?? null,
      issue_date: this.toDateInputValue(item.issue_date),
      quantity: item.quantity ?? 0,
      unit_price: item.unit_price ?? 0,
      total_amount: item.total_amount ?? 0,
      remark: item.remark ?? '',
    });
  }

  private getActiveDepartmentId(): number | null {
    const routeDepartmentId = this.route.snapshot.paramMap.get('departmentId');
    const departmentIdFromRoute = routeDepartmentId ? Number(routeDepartmentId) : null;

    if (departmentIdFromRoute && Number.isFinite(departmentIdFromRoute)) {
      return departmentIdFromRoute;
    }

    const procurementDepartmentId = this.procurementrecord?.department_id;
    if (procurementDepartmentId && Number.isFinite(procurementDepartmentId)) {
      return procurementDepartmentId;
    }

    if (this.departmentIdFromState && Number.isFinite(this.departmentIdFromState)) {
      return this.departmentIdFromState;
    }

    return null;
  }

  private navigateBackToDepartment() {
    const departmentId = this.getActiveDepartmentId();
    if (!departmentId) {
      this.router.navigate(['/admin/MaterialItems']);
      return;
    }

    this.router.navigate(['/admin/MaterialItem/by-department', departmentId], {
      state: {
        depart: history.state?.depart,
      },
    });
  }

  submit() {
    if (this.isEditMode()) {
      this.submitEdit();
      return;
    }

    this.submitCreateMany();
  }

  private submitEdit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const departmentId = this.getActiveDepartmentId();
    const payload: Partial<MaterialIssueDetailTypes> = {
      issue_detail_id: this.issue_detail_id() ?? 0,
      procurement_record_id: raw.procurement_record_id ?? null,
      department_id: departmentId,
      material_item_id: raw.material_item_id!,
      staff_id: raw.staff_id!,
      issue_date: raw.issue_date || null,
      quantity: Number(raw.quantity ?? 0),
      unit_price: Number(raw.unit_price ?? 0),
      total_amount: Number(raw.quantity ?? 0) * Number(raw.unit_price ?? 0),
      remark: raw.remark ?? '',
    };

    this.isSubmitting.set(true);

    this.materialIssueDetailService
      .updateMaterialIssueDetail(this.issue_detail_id()!, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.snackbar.success('แก้ไขข้อมูลสำเร็จ');
          const procurementRecordId = this.form.controls.procurement_record_id.value;
          this.router.navigate(['/admin/MaterialIssueDetail', procurementRecordId], {
            state: {
              procurementrecord: history.state?.procurementrecord,
            },
          });
        },
        error: (err) => {
          const message =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || 'แก้ไขข้อมูลไม่สำเร็จ';

          this.snackbar.error(message);
        },
      });
  }

  private submitCreateMany() {
    if (this.createForm.invalid || this.items.length === 0) {
      this.createForm.markAllAsTouched();
      this.items.controls.forEach((group) => group.markAllAsTouched());
      return;
    }

    const raw = this.createForm.getRawValue();
    const departmentId = this.getActiveDepartmentId();
    const payload = {
      items: (raw.items ?? []).map((item: any) => ({
        procurement_record_id: raw.procurement_record_id ?? null,
        department_id: departmentId,
        material_item_id: item.material_item_id,
        staff_id: raw.staff_id!,
        issue_date: raw.issue_date || new Date().toISOString().slice(0, 10),
        quantity: Number(item.quantity ?? 0),
        unit_price: Number(item.unit_price ?? 0),
        total_amount: Number(item.quantity ?? 0) * Number(item.unit_price ?? 0),
        remark: item.remark ?? '',
      })),
    };

    this.isSubmitting.set(true);

    this.materialIssueDetailService
      .createManyMaterialIssueDetails(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.snackbar.success('เพิ่มข้อมูลสำเร็จ');

          const procurementRecordId = this.createForm.controls.procurement_record_id.value;
          if (this.fromMaterialItems) {
            this.navigateBackToDepartment();
            return;
          }

          this.router.navigate(['/admin/MaterialIssueDetail', procurementRecordId], {
            state: {
              procurementrecord: history.state?.procurementrecord,
            },
          });
        },
        error: (err) => {
          const message =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || 'แก้ไขข้อมูลไม่สำเร็จ';

          this.snackbar.error(message);
        },
      });
  }

  cancel() {
    if (!this.isEditMode() && this.fromMaterialItems) {
      this.navigateBackToDepartment();
      return;
    }

    const procurementRecordId = this.isEditMode()
      ? this.form.controls.procurement_record_id.value
      : this.createForm.controls.procurement_record_id.value;

    this.router.navigate(['/admin/MaterialIssueDetail', procurementRecordId], {
      state: {
        procurementrecord: history.state?.procurementrecord,
        depart: history.state?.depart,
      },
    });
  }
}
