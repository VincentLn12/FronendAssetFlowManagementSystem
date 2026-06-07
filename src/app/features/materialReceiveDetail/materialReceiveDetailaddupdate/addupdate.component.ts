import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { materialReceiveDetailTypes } from '../interface/materialReceiveDetailTypes';
import { MaterialReceiveDetailService } from '../service/materialReceiveDetail.service';
import { StaffsService } from '../../staffs/service/staffsType.service';
import { SelectComponent, TextareaComponent } from '../../../../shared';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';
import { MaterialItemsService } from '../../MaterialItems/service/materialItems.service';

@Component({
  selector: 'app-asset-items-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './addupdate.component.html',
})
export class MaterialReceiveDetailAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialReceiveDetailService = inject(MaterialReceiveDetailService);
  private snackbar = inject(SnackbarService);

  receive_detail_id = signal<number | null>(null);
  isEditMode = computed(() => this.receive_detail_id() !== null);

  name = 'รายละเอียดการรับวัสดุ';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  //loaddropdown
  private materialItemsService = inject(MaterialItemsService);
  procurementrecord = history.state?.procurementrecord;

  materialitems = signal<any[]>([]);

  form = this.fb.group({
    receive_detail_id: [0],
    procurement_record_id: [null as number | null, Validators.required],
    material_item_id: [null as number | null, Validators.required],
    quantity: [0, Validators.required],
    unit_price: [0, Validators.required],
    total_amount: [0],
    operation_reason: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id && Number.isFinite(id)) {
      this.receive_detail_id.set(id);
      this.loadMaterialReceiveDetail(id);
    }

    this.form.controls.material_item_id.valueChanges.subscribe((id) => {
      const selectedItem = this.materialitems().find((x) => x.material_item_id === Number(id));

      if (!selectedItem) return;

      this.form.patchValue({
        unit_price: selectedItem.unit_price ?? 0,
        total_amount:
          Number(this.form.controls.quantity.value ?? 0) * Number(selectedItem.unit_price ?? 0),
      });
    });

    this.form.controls.quantity.valueChanges.subscribe((qty) => {
      const unitPrice = Number(this.form.controls.unit_price.value ?? 0);

      this.form.patchValue(
        {
          total_amount: Number(qty ?? 0) * unitPrice,
        },
        { emitEvent: false },
      );
    });

    const procurementRecordIdParam = this.route.snapshot.queryParamMap.get('procurement_record_id');

    const procurementRecordId = procurementRecordIdParam ? Number(procurementRecordIdParam) : null;

    if (procurementRecordId && Number.isFinite(procurementRecordId)) {
      this.form.patchValue({
        procurement_record_id: procurementRecordId,
      });
    }
  }

  private loadMaterialReceiveDetail(id: number) {
    const stateMaterialReceiveDetail = history.state?.MaterialReceiveDetail as
      | materialReceiveDetailTypes
      | undefined;

    if (stateMaterialReceiveDetail?.receive_detail_id === id) {
      this.patchForm(stateMaterialReceiveDetail);
      return;
    }

    this.isLoading.set(true);

    this.materialReceiveDetailService
      .getMaterialReceiveDetail(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (item) => this.patchForm(item),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/materialReceiveDetails']);
        },
      });
  }

  private loadDropdowns() {
    this.materialItemsService
      .getMaterialItems({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      })
      .subscribe({
        next: (res) => {
          const items = res.data.map((x: any) => ({
            ...x,
            display_name: `${x.material_code} - ${x.material_name}  ราคา ${x.unit_price ?? 0} บาท `,
          }));

          this.materialitems.set(items);
        },
        error: () => {
          this.snackbar.error('โหลดข้อมูลวัสดุไม่สำเร็จ');
        },
      });
  }

  private patchForm(item: materialReceiveDetailTypes) {
    this.form.patchValue({
      receive_detail_id: item.receive_detail_id ?? 0,
      procurement_record_id: item.procurement_record_id ?? null,
      material_item_id: item.material_item_id ?? null,
      quantity: item.quantity ?? 0,
      unit_price: item.unit_price ?? 0,
      total_amount: item.total_amount ?? 0,
      operation_reason: item.operation_reason ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: Partial<materialReceiveDetailTypes> = {
      receive_detail_id: this.receive_detail_id() ?? 0,
      procurement_record_id: raw.procurement_record_id!,
      material_item_id: raw.material_item_id!,
      quantity: Number(raw.quantity ?? 0),
      unit_price: Number(raw.unit_price ?? 0),
      total_amount: Number(raw.quantity ?? 0) * Number(raw.unit_price ?? 0),
      operation_reason: raw.operation_reason ?? '',
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.materialReceiveDetailService.updateMaterialReceiveDetail(
          this.receive_detail_id()!,
          payload,
        )
      : this.materialReceiveDetailService.createMaterialReceiveDetail(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        const procurementRecordId = this.form.controls.procurement_record_id.value;

        this.router.navigate(['/admin/materialReceiveDetails', procurementRecordId]);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const procurementRecordId = this.form.controls.procurement_record_id.value;

    this.router.navigate(['/admin/materialReceiveDetails', procurementRecordId], {
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }
}
