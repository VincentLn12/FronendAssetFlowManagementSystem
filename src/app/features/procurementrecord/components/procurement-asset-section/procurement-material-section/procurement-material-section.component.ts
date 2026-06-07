import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, SelectComponent, TextareaComponent } from '../../../../../../shared';

export interface MaterialSectionPayload {
  material_receive_details: {
    receive_detail_id: number;
    procurement_record_id: number;
    item_no: number;
    material_item_id: number | null;
    quantity: number;
    unit_price: number;
    total_amount: number;
    operation_reason: string | null;
  }[];
}

@Component({
  selector: 'app-procurement-material-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './procurement-material-section.component.html',
})
export class ProcurementMaterialSectionComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() materialItems: any[] = [];

  @Output() payloadChange = new EventEmitter<MaterialSectionPayload>();
  @Output() validityChange = new EventEmitter<boolean>();

  materialDetails = new FormArray<FormGroup>([]);

  get materialDetailForms() {
    return this.materialDetails.controls;
  }

  ngOnInit(): void {
    this.emitPayload();
  }

  addMaterialDetail() {
    const group = this.fb.group({
      receive_detail_id: [0],
      procurement_record_id: [0],
      material_item_id: [null as number | null, Validators.required],
      quantity: [0, Validators.required],
      unit_price: [0, Validators.required],
      total_amount: [0],
      operation_reason: [''],
    });

    group.controls.material_item_id.valueChanges.subscribe((id) => {
      const selectedItem = this.materialItems.find(
        (x) => Number(x.material_item_id) === Number(id),
      );

      if (!selectedItem) return;

      const quantity = Number(group.controls.quantity.value ?? 0);
      const unitPrice = Number(selectedItem.unit_price ?? 0);

      group.patchValue(
        {
          unit_price: unitPrice,
          total_amount: quantity * unitPrice,
        },
        { emitEvent: false },
      );

      this.emitPayload();
    });

    group.controls.quantity.valueChanges.subscribe((qty) => {
      const unitPrice = Number(group.controls.unit_price.value ?? 0);

      group.patchValue(
        {
          total_amount: Number(qty ?? 0) * unitPrice,
        },
        { emitEvent: false },
      );

      this.emitPayload();
    });

    this.materialDetails.push(group);
    this.emitPayload();
  }

  removeMaterialDetail(index: number) {
    this.materialDetails.removeAt(index);
    this.emitPayload();
  }

  isValid() {
    return this.materialDetails.valid && this.materialDetails.length > 0;
  }

  private emitPayload() {
    const payload: MaterialSectionPayload = {
      material_receive_details: this.materialDetails.getRawValue().map((x: any, index: number) => ({
        receive_detail_id: 0,
        procurement_record_id: 0,
        item_no: index + 1,
        material_item_id: x.material_item_id,
        quantity: Number(x.quantity ?? 0),
        unit_price: Number(x.unit_price ?? 0),
        total_amount: Number(x.quantity ?? 0) * Number(x.unit_price ?? 0),
        operation_reason: x.operation_reason || null,
      })),
    };

    this.payloadChange.emit(payload);
    this.validityChange.emit(this.isValid());
  }
}
