import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, SelectComponent } from '../../../../../../shared';
import { DatePickerComponent } from '../../../../../shared/date-picker/date-picker.component';

export interface AssetSectionPayload {
  asset_item: {
    asset_id: number;
    procurement_record_id: number;
    item_no: number;
    // asset_code_prefix: string;
    asset_name: string;
    receive_date: string;
    fund_category_id: number | null;
    department_id: number | null;
    acquisition_method_id: number | null;
  };

  asset_sub_items: {
    asset_sub_item_id: number;
    asset_id: number;
    item_no: number;
    sub_item_name: string;
    asset_category_id: number | null;
    // running_start_no: number;
    // running_end_no: number;
    // fiscal_asset_year: number;
    quantity: number;
    unit_id: number | null;
    unit_price: number;
    total_price: number;
    useful_life_year: number;
  }[];
}

@Component({
  selector: 'app-procurement-asset-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
  ],
  templateUrl: './procurement-asset-section.component.html',
})
export class ProcurementAssetSectionComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() fundCategorys: any[] = [];
  @Input() departments: any[] = [];
  @Input() acquisitionMethods: any[] = [];
  @Input() assetCategories: any[] = [];
  @Input() units: any[] = [];

  @Output() payloadChange = new EventEmitter<AssetSectionPayload>();
  @Output() validityChange = new EventEmitter<boolean>();

  assetItemForm = this.fb.group({
    asset_id: [0],
    procurement_record_id: [0],
    item_no: [1],
    // asset_code_prefix: [''],
    asset_name: ['', Validators.required],
    receive_date: [new Date().toISOString().split('T')[0], Validators.required],
    fund_category_id: [null as number | null, Validators.required],
    department_id: [null as number | null, Validators.required],
    acquisition_method_id: [null as number | null, Validators.required],
  });

  assetSubItems = new FormArray<FormGroup>([]);

  get assetSubItemForms() {
    return this.assetSubItems.controls;
  }

  ngOnInit(): void {
    this.assetItemForm.valueChanges.subscribe(() => this.emitPayload());
    this.assetSubItems.valueChanges.subscribe(() => this.emitPayload());

    this.emitPayload();
  }

  addAssetSubItem() {
    const group = this.fb.group({
      asset_sub_item_id: [0],
      asset_id: [0],
      item_no: [this.assetSubItems.length + 1],
      sub_item_name: ['', Validators.required],
      asset_category_id: [null as number | null, Validators.required],
      quantity: [1, Validators.required],
      unit_id: [null as number | null, Validators.required],
      unit_price: [0],
      total_price: [0],
      useful_life_year: [5, Validators.required],
    });

    group.valueChanges.subscribe(() => {
      const quantity = Number(group.controls.quantity.value || 0);
      const unitPrice = Number(group.controls.unit_price.value || 0);

      group.patchValue(
        {
          total_price: quantity * unitPrice,
        },
        { emitEvent: false },
      );

      this.emitPayload();
    });

    this.assetSubItems.push(group);
    this.emitPayload();
  }

  removeAssetSubItem(index: number) {
    this.assetSubItems.removeAt(index);

    this.assetSubItems.controls.forEach((control, i) => {
      control.patchValue({ item_no: i + 1 });
    });

    this.emitPayload();
  }

  markAllAsTouched() {
    this.assetItemForm.markAllAsTouched();
    this.assetSubItems.controls.forEach((control) => control.markAllAsTouched());
  }

  isValid() {
    return this.assetItemForm.valid && this.assetSubItems.valid && this.assetSubItems.length > 0;
  }

  private formatDate(value: any): string {
    if (!value) return '';

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value;
  }

  private emitPayload() {
    const assetItemRaw = this.assetItemForm.getRawValue();

    const payload: AssetSectionPayload = {
      asset_item: {
        asset_id: 0,
        procurement_record_id: 0,
        item_no: assetItemRaw.item_no ?? 1,
        asset_name: assetItemRaw.asset_name ?? '',
        receive_date: this.formatDate(assetItemRaw.receive_date),
        fund_category_id: assetItemRaw.fund_category_id,
        department_id: assetItemRaw.department_id,
        acquisition_method_id: assetItemRaw.acquisition_method_id,
      },

      asset_sub_items: this.assetSubItems.getRawValue().map((x: any, index: number) => ({
        asset_sub_item_id: 0,
        asset_id: 0,
        item_no: index + 1,
        sub_item_name: x.sub_item_name ?? '',
        asset_category_id: x.asset_category_id,
        quantity: Number(x.quantity || 0),
        unit_id: x.unit_id,
        unit_price: Number(x.unit_price || 0),
        total_price: Number(x.quantity || 0) * Number(x.unit_price || 0),
        useful_life_year: Number(x.useful_life_year || 0),
      })),
    };

    this.payloadChange.emit(payload);
    this.validityChange.emit(this.isValid());
  }
}
