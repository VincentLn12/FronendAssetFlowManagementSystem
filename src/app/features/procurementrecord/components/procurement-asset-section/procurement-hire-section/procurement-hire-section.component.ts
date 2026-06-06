import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, SelectComponent } from '../../../../../../shared';
import { toThaiBahtText } from '../../../../../shared/thai-baht-text';

export interface HireSectionPayload {
  hire_details: {
    hire_detail_id: number;
    procurement_record_id: number;
    item_no: number;
    hire_name: string;
    quantity: number;
    unit_id: number | null;
    unit_price: number;
    total_amount: number;
    total_text: string;
    operation_reason: string | null;
    remark: string | null;
  }[];
}

@Component({
  selector: 'app-procurement-hire-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './procurement-hire-section.component.html',
})
export class ProcurementHireSectionComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() units: any[] = [];

  @Output() payloadChange = new EventEmitter<HireSectionPayload>();
  @Output() validityChange = new EventEmitter<boolean>();

  hireDetails = new FormArray<FormGroup>([]);

  get hireDetailForms() {
    return this.hireDetails.controls;
  }

  ngOnInit(): void {
    this.emitPayload();
  }

  addHireDetail() {
    const group = this.fb.group({
      hire_detail_id: [0],
      procurement_record_id: [0],
      item_no: [this.hireDetails.length + 1],
      hire_name: ['', Validators.required],
      quantity: [1, Validators.required],
      unit_id: [null as number | null, Validators.required],
      unit_price: [0, Validators.required],
      total_amount: [0],
      total_text: [''],
      operation_reason: [''],
      remark: [''],
    });

    group.valueChanges.subscribe(() => {
      const quantity = Number(group.controls.quantity.value || 0);
      const unitPrice = Number(group.controls.unit_price.value || 0);
      const total = quantity * unitPrice;

      group.patchValue(
        {
          total_amount: total,
          total_text: toThaiBahtText(total),
        },
        { emitEvent: false },
      );

      this.emitPayload();
    });

    this.hireDetails.push(group);
    this.emitPayload();
  }

  removeHireDetail(index: number) {
    this.hireDetails.removeAt(index);

    this.hireDetails.controls.forEach((control, i) => {
      control.patchValue({ item_no: i + 1 });
    });

    this.emitPayload();
  }

  isValid() {
    return this.hireDetails.valid && this.hireDetails.length > 0;
  }

  markAllAsTouched() {
    this.hireDetails.controls.forEach((control) => control.markAllAsTouched());
  }

  private emitPayload() {
    const payload: HireSectionPayload = {
      hire_details: this.hireDetails.getRawValue().map((x: any, index: number) => {
        const quantity = Number(x.quantity || 0);
        const unitPrice = Number(x.unit_price || 0);
        const total = quantity * unitPrice;

        return {
          hire_detail_id: 0,
          procurement_record_id: 0,
          item_no: index + 1,
          hire_name: x.hire_name ?? '',
          quantity,
          unit_id: x.unit_id,
          unit_price: unitPrice,
          total_amount: total,
          total_text: toThaiBahtText(total),
          operation_reason: x.operation_reason || null,
          remark: x.remark || null,
        };
      }),
    };

    this.payloadChange.emit(payload);
    this.validityChange.emit(this.isValid());
  }
}
