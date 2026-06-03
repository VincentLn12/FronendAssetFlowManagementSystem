import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { assetRepairsTypes } from '../interface/assetRepairsTypes';
import { AssetRepairsService } from '../service/assetRepairs.service';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';
import { TextareaComponent, SelectComponent } from '../../../../shared';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerComponent,
    InputComponent,
    TextareaComponent,
    SelectComponent,
  ],
  templateUrl: './addupdate.component.html',
})
export class AssetRepairsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetRepairsService = inject(AssetRepairsService);
  private snackbar = inject(SnackbarService);

  procurement_withdrawal_id = signal<number | null>(null);
  asset_repair_id = signal<number | null>(null);

  isEditMode = computed(() => this.asset_repair_id() !== null);

  name = 'ประวัติการซ่อมบำรุงรักษาทรัพย์สิน';
  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  statusOptions = [
    { label: 'ส่งซ่อม', value: 'ส่งซ่อม' },
    { label: 'ซ่อมเสร็จ', value: 'ซ่อมเสร็จ' },
    { label: 'ยกเลิก', value: 'ยกเลิก' },
  ];

  form = this.fb.nonNullable.group({
    repair_document_no: [''],
    repair_date: [new Date(), [Validators.required]],
    problem_description: [''],
    repair_description: [''],
    repair_shop_name: [''],
    repair_cost: [0],
    decree_document_no: [''],
    status: ['ส่งซ่อม', Validators.required],
    procurement_withdrawal_id: [0, Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const repairId = idParam ? Number(idParam) : null;

    const assetIdParam = this.route.snapshot.queryParamMap.get('asset_id');
    const assetId = assetIdParam ? Number(assetIdParam) : null;

    // โหมดแก้ไข
    if (repairId && Number.isFinite(repairId)) {
      this.asset_repair_id.set(repairId);
      this.loadAssetRepair(repairId);
      return;
    }

    // โหมดเพิ่ม
    if (assetId && Number.isFinite(assetId)) {
      this.procurement_withdrawal_id.set(assetId);
      this.form.patchValue({
        procurement_withdrawal_id: assetId,
      });
      return;
    }

    this.snackbar.error('ไม่พบรหัสครุภัณฑ์');
    this.cancel();
  }

  private loadAssetRepair(id: number) {
    const stateAssetRepair = history.state?.assetRepair as assetRepairsTypes | undefined;

    if (stateAssetRepair?.asset_repair_id === id) {
      this.patchForm(stateAssetRepair);
      return;
    }

    this.isLoading.set(true);

    this.assetRepairsService
      .getAssetRepair(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.patchForm(response),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.cancel();
        },
      });
  }

  private patchForm(item: assetRepairsTypes) {
    this.procurement_withdrawal_id.set(item.procurement_withdrawal_id);

    this.form.patchValue({
      repair_document_no: item.repair_document_no ?? '',
      repair_date: new Date(item.repair_date),
      problem_description: item.problem_description ?? '',
      repair_description: item.repair_description ?? '',
      repair_shop_name: item.repair_shop_name ?? '',
      repair_cost: item.repair_cost ?? 0,
      decree_document_no: item.decree_document_no ?? '',
      status: item.status ?? 'ส่งซ่อม',
      procurement_withdrawal_id: item.procurement_withdrawal_id ?? 0,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const payload: assetRepairsTypes = {
      asset_repair_id: this.asset_repair_id() ?? 0,
      procurement_withdrawal_id: value.procurement_withdrawal_id,
      repair_document_no: value.repair_document_no.trim(),
      repair_date: value.repair_date.toISOString(),
      problem_description: value.problem_description.trim(),
      repair_description: value.repair_description?.trim() || null,
      repair_shop_name: value.repair_shop_name?.trim() || null,
      repair_cost: value.repair_cost,
      decree_document_no: value.decree_document_no?.trim() || null,
      status: value.status,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetRepairsService.updateAssetRepairs(this.asset_repair_id()!, payload)
      : this.assetRepairsService.createAssetRepairs(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.cancel();
      },
      error: (error) => {
        console.log('error:', error.error);
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const assetId = this.procurement_withdrawal_id() || history.state?.asset_id;

    if (!assetId) {
      this.router.navigate(['/admin/assetRepairs', assetId]);
      return;
    }

    this.router.navigate(['/admin/assetRepairs', assetId], {
      state: {
        assetItem: history.state?.assetItem,
        procurementrecord: history.state?.procurementrecord,
        procurement_record_id: history.state?.procurement_record_id,
      },
    });
  }
}
