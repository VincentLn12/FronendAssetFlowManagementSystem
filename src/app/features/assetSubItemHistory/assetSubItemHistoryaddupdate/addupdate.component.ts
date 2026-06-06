import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SelectComponent } from '../../../../shared';
import { AssetSubItemHistoryService } from '../service/assetSubItemHistory.service';
import { assetSubItemHistoryTypes } from '../interface/assetSubItemHistoryTypes';
import { AssetUsageTypeService } from '../../assetUsageType/service/assetUsageType.service';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';
import { StaffsService } from '../../staffs/service/staffsType.service';

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
export class AssetSubItemHistoryAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetSubItemHistoryService = inject(AssetSubItemHistoryService);
  private snackbar = inject(SnackbarService);

  sub_item_history_id = signal<number | null>(null);
  isEditMode = computed(() => this.sub_item_history_id() !== null);

  name = 'คุรุภัณฑ์ย่อย';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  //loaddropdown
  private AssetUsageTypeService = inject(AssetUsageTypeService);
  private StaffsService = inject(StaffsService);

  AssetUsage = signal<any[]>([]);
  Staffs = signal<any[]>([]);

  form = this.fb.group({
    sub_item_history_id: 0,
    procurement_withdrawal_id: this.fb.control<number | null>(null, Validators.required),
    history_date: [new Date(), [Validators.required]],
    history_type: this.fb.control<string | null>(null, Validators.required),
    usage_type_id: this.fb.control<number | null>(null, Validators.required),
    detail: this.fb.control<string | null>(null),
    staff_id: this.fb.control<number | null>(null),
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.sub_item_history_id.set(id);
      this.loadAssetItem(id);
    }

    const procurementWithdrawalIdParam = this.route.snapshot.queryParamMap.get(
      'procurement_withdrawal_id',
    );
    const procurement_withdrawal_id = procurementWithdrawalIdParam
      ? Number(procurementWithdrawalIdParam)
      : null;

    if (procurement_withdrawal_id && Number.isFinite(procurement_withdrawal_id)) {
      this.form.controls.procurement_withdrawal_id.setValue(procurement_withdrawal_id);
    }
  }

  private loadAssetItem(id: number) {
    const stateAssetItem = history.state?.assetItem as assetSubItemHistoryTypes | undefined;

    if (stateAssetItem?.procurement_withdrawal_id === id) {
      this.patchForm(stateAssetItem);
      return;
    }

    this.isLoading.set(true);

    this.assetSubItemHistoryService
      .getassetSubItemHistory(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (item) => this.patchForm(item),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/AssetSubItemHistory']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      assetCategories: this.AssetUsageTypeService.getAssetUsageTypes({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      Staffs: this.StaffsService.getStaffs({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.AssetUsage.set(res.assetCategories.data);
        this.Staffs.set(res.Staffs.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private patchForm(item: assetSubItemHistoryTypes) {
    this.form.patchValue({
      sub_item_history_id: item.sub_item_history_id,
      procurement_withdrawal_id: item.procurement_withdrawal_id,
      history_date: item.history_date ? new Date(item.history_date) : new Date(),
      history_type: item.history_type,
      usage_type_id: item.usage_type_id,
      detail: item.detail,
      staff_id: item.staff_id,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<assetSubItemHistoryTypes> = {
      sub_item_history_id: this.form.controls.sub_item_history_id.value,
      procurement_withdrawal_id: this.form.controls.procurement_withdrawal_id.value,
      history_date: this.form.controls.history_date.value
        ? new Date(this.form.controls.history_date.value).toISOString()
        : null,
      history_type: this.form.controls.history_type.value,
      usage_type_id: this.form.controls.usage_type_id.value,
      detail: this.form.controls.detail.value,
      staff_id: this.form.controls.staff_id.value,
    };

    console.log('Payload:', payload);
    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetSubItemHistoryService.updateassetSubItemHistory(
          this.sub_item_history_id()!,
          payload,
        )
      : this.assetSubItemHistoryService.createassetSubItemHistory(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        this.router.navigate([
          '/admin/AssetSubItemHistory',
          this.form.controls.procurement_withdrawal_id.value,
        ]);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate([
      '/admin/AssetSubItemHistory',
      this.form.controls.procurement_withdrawal_id.value,
    ]);
  }
}
