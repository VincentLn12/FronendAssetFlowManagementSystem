import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { assetWithdrawalCreateTypes } from '../interface/assetWithdrawalTypes';
import { AssetWithdrawalService } from '../service/assetWithdrawal.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { SelectComponent, TextareaComponent } from '../../../../shared';
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
    TextareaComponent,
  ],
  templateUrl: './addupdate.component.html',
})
export class AssetWithdrawalAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetWithdrawalService = inject(AssetWithdrawalService);
  private snackbar = inject(SnackbarService);

  procurement_withdrawal_id = signal<number | null>(null);
  isEditMode = computed(() => this.procurement_withdrawal_id() !== null);

  name = 'ครุภัณฑ์';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  //loaddropdown
  private staffsService = inject(StaffsService);
  procurementrecord = history.state?.procurementrecord;

  staffs = signal<any[]>([]);

  form = this.fb.group({
    procurement_withdrawal_id: [0],
    procurement_record_id: [null as number | null],
    staff_id: [this.procurementrecord?.staff_id ?? null, Validators.required],
    storage_location: [''],
    purpose: [''],
    remark: [''],
    withdrawal_date: [new Date().toISOString().split('T')[0], [Validators.required]],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id && Number.isFinite(id)) {
      this.procurement_withdrawal_id.set(id);
      this.loadAssetWithdrawal(id);
    }

    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');

    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.form.patchValue({
        procurement_record_id: procurementRecordId,
      });
    }
  }

  private loadAssetWithdrawal(id: number) {
    const stateAssetWithdrawal = history.state?.assetWithdrawal as
      | assetWithdrawalCreateTypes
      | undefined;

    if (stateAssetWithdrawal?.procurement_withdrawal_id === id) {
      this.patchForm(stateAssetWithdrawal);
      return;
    }

    this.isLoading.set(true);

    // this.assetWithdrawalService
    //   .getAssetWithdrawalbyProcuremen(id)
    //   .pipe(finalize(() => this.isLoading.set(false)))
    //   .subscribe({
    //     next: (item) => this.patchForm(item),
    //     error: () => {
    //       this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
    //       this.router.navigate(['/admin/AssetWithdrawal']);
    //     },
    //   });
  }

  private loadDropdowns() {
    forkJoin({
      staff: this.staffsService.getStaffs({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.staffs.set(res.staff.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private patchForm(item: assetWithdrawalCreateTypes) {
    const staff_fullname = this.route.snapshot.queryParamMap.get('staff_fullname');

    const staff_fullnames = staff_fullname ? Number(staff_fullname) : null;

    this.form.patchValue({
      procurement_withdrawal_id: item.procurement_withdrawal_id ?? null,
      procurement_record_id: item.procurement_record_id ?? null,
      staff_id: item.staff_id ?? null,
      storage_location: item.storage_location ?? '',
      purpose: item.purpose ?? '',
      remark: item.remark ?? '',
      withdrawal_date: item.withdrawal_date ?? new Date().toISOString().split('T')[0],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<assetWithdrawalCreateTypes> = {
      procurement_withdrawal_id: this.procurement_withdrawal_id() ?? 0,
      procurement_record_id: this.form.controls.procurement_record_id.value!,
      staff_id: this.form.controls.staff_id.value,
      storage_location: this.form.controls.storage_location.value,
      purpose: this.form.controls.purpose.value,
      remark: this.form.controls.remark.value,
      withdrawal_date: this.form.controls.withdrawal_date.value,
    };
    console.log(payload);
    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetWithdrawalService.updateAssetWithdrawal(
          this.procurement_withdrawal_id()!,
          payload,
        )
      : this.assetWithdrawalService.createAssetWithdrawal(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        const procurementRecordId = this.form.controls.procurement_record_id.value;

        this.router.navigate(['/admin/AssetWithdrawal', procurementRecordId]);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const procurementRecordId = this.form.controls.procurement_record_id.value;

    this.router.navigate(['/admin/AssetWithdrawal', procurementRecordId], {
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }
}
