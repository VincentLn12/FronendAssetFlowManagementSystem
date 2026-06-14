import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { SelectComponent, TextareaComponent } from '../../../../shared';
import { MaterialWithdrawalService } from '../service/materialWithdrawal.service';
import { MaterialWithdrawalCreateTypes } from '../interface/materialWithdrawalTypes';

@Component({
  selector: 'app-material-withdrawal-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './addupdate.component.html',
})
export class MaterialWithdrawalAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialWithdrawalService = inject(MaterialWithdrawalService);
  private snackbar = inject(SnackbarService);
  private staffsService = inject(StaffsService);

  material_withdrawal_id = signal<number | null>(null);
  isEditMode = computed(() => this.material_withdrawal_id() !== null);

  name = 'ใบเบิกวัสดุ';
  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  procurementrecord = history.state?.procurementrecord;
  staffs = signal<any[]>([]);

  form = this.fb.group({
    material_withdrawal_id: [0],
    procurement_record_id: [null as number | null, Validators.required],

    // เลขที่จัดซื้อ
    material_receive_id: [''],

    // เลขที่อ้างอิง
    receive_document_no: [''],

    // เลขที่ใบเบิก
    withdrawal_document_no: [''],

    staff_id: [this.procurementrecord?.staff_id ?? null, Validators.required],
    remark: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.material_withdrawal_id.set(id);
      this.loadMaterialWithdrawal(id);
    }

    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');
    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.form.patchValue({
        procurement_record_id: procurementRecordId,
      });
    }
  }

  private loadMaterialWithdrawal(id: number) {
    const stateMaterialWithdrawal = history.state?.materialWithdrawal as
      | MaterialWithdrawalCreateTypes
      | undefined;

    if (stateMaterialWithdrawal?.material_withdrawal_id === id) {
      this.patchForm(stateMaterialWithdrawal);
      return;
    }

    this.isLoading.set(true);

    this.materialWithdrawalService
      .getMaterialWithdrawal(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (item) => this.patchForm(item),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/MaterialWithdrawal']);
        },
      });
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

  private patchForm(item: MaterialWithdrawalCreateTypes) {
    this.form.patchValue({
      material_withdrawal_id: item.material_withdrawal_id ?? 0,
      procurement_record_id: item.procurement_record_id ?? null,
      material_receive_id: item.material_receive_id ?? '',
      receive_document_no: item.receive_document_no ?? '',
      withdrawal_document_no: item.withdrawal_document_no ?? '',
      staff_id: item.staff_id ?? null,
      remark: item.remark ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<MaterialWithdrawalCreateTypes> = {
      material_withdrawal_id: this.material_withdrawal_id() ?? 0,
      procurement_record_id: this.form.controls.procurement_record_id.value!,
      material_receive_id: this.form.controls.material_receive_id.value,
      receive_document_no: this.form.controls.receive_document_no.value,
      withdrawal_document_no: this.form.controls.withdrawal_document_no.value,
      staff_id: this.form.controls.staff_id.value!,
      remark: this.form.controls.remark.value,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.materialWithdrawalService.updateMaterialWithdrawal(
          this.material_withdrawal_id()!,
          payload,
        )
      : this.materialWithdrawalService.createMaterialWithdrawal(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        const procurementRecordId = this.form.controls.procurement_record_id.value;

        this.router.navigate(['/admin/MaterialWithdrawal', procurementRecordId], {
          state: {
            procurementrecord: history.state?.procurementrecord,
          },
        });
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const procurementRecordId = this.form.controls.procurement_record_id.value;

    this.router.navigate(['/admin/MaterialWithdrawal', procurementRecordId], {
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }
}
