import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AssetCategoriesService } from '../../assetCategories/service/assetCategories.service';
import { SelectComponent } from '../../../../shared';
import { AssetSubItemsService } from '../service/assetsubItem.service';
import { assetSubItemCreateTypes } from '../interface/assetsubItemsTypes';
import { MaterialUnitsService } from '../../materialUnits/service/materialUnits.service';

@Component({
  selector: 'app-asset-items-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './addupdate.component.html',
})
export class AssetSubItemsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetSubItemsService = inject(AssetSubItemsService);
  private snackbar = inject(SnackbarService);

  asset_sub_item_id = signal<number | null>(null);
  isEditMode = computed(() => this.asset_sub_item_id() !== null);

  name = 'ครุภัณฑ์ย่อย';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));

  isLoading = signal(false);
  isSubmitting = signal(false);

  //loaddropdown
  private assetCategoriesService = inject(AssetCategoriesService);
  private materialUnitsService = inject(MaterialUnitsService);

  asset_category = signal<any[]>([]);
  unit = signal<any[]>([]);

  form = this.fb.group({
    asset_sub_item_id: [0 as number | null],
    asset_id: [null as number | null, [Validators.required]],
    item_no: [0 as number | null],
    sub_item_name: ['', [Validators.required]],
    asset_category_id: [null as number | null, [Validators.required]],
    running_start_no: [0],
    running_end_no: [0],
    fiscal_asset_year: [0],
    quantity: [1, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    unit_id: [null as number | null, [Validators.required]],
    unit_price: [0 as number | null],
    total_price: [0 as number | null],
    useful_life_year: [0],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    this.form.controls.quantity.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });

    this.form.controls.unit_price.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });

    if (id && Number.isFinite(id)) {
      this.asset_sub_item_id.set(id);
      this.loadAssetItem(id);
    }

    const asset_idParam = this.route.snapshot.queryParamMap.get('asset_id');
    const asset_id = asset_idParam ? Number(asset_idParam) : null;

    if (asset_id && Number.isFinite(asset_id)) {
      this.form.patchValue({
        asset_id: asset_id,
      });
    }
  }

  private loadAssetItem(id: number) {
    const stateAssetItem = history.state?.assetItem as assetSubItemCreateTypes | undefined;

    if (stateAssetItem?.asset_id === id) {
      this.patchForm(stateAssetItem);
      return;
    }

    this.isLoading.set(true);

    this.assetSubItemsService
      .getAssetSubItem(id)
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
      unit: this.materialUnitsService.getMaterialUnits({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.asset_category.set(res.assetCategories.data);
        this.unit.set(res.unit.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private calculateTotalPrice() {
    const quantity = Number(this.form.controls.quantity.value ?? 0);
    const unitPrice = Number(this.form.controls.unit_price.value ?? 0);

    const total = quantity * unitPrice;

    this.form.controls.total_price.setValue(total, {
      emitEvent: false,
    });
  }
  private patchForm(item: assetSubItemCreateTypes) {
    this.form.patchValue({
      asset_sub_item_id: item.asset_sub_item_id ?? null,
      asset_id: item.asset_id ?? null,
      item_no: item.item_no ?? 0,
      sub_item_name: item.sub_item_name ?? '',
      asset_category_id: item.asset_category_id ?? null,
      running_start_no: item.running_start_no ?? 0,
      running_end_no: item.running_end_no ?? 0,
      fiscal_asset_year: item.fiscal_asset_year ?? 67,
      quantity: item.quantity ?? 1,
      unit_id: item.unit_id ?? null,
      unit_price: item.unit_price ?? null,
      total_price: item.total_price ?? null,
      useful_life_year: item.useful_life_year ?? 0,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<assetSubItemCreateTypes> = {
      asset_sub_item_id: this.form.controls.asset_sub_item_id.value,
      asset_id: this.form.controls.asset_id.value!,
      item_no: this.form.controls.item_no.value,
      sub_item_name: this.form.controls.sub_item_name.value?.trim() ?? '',
      asset_category_id: this.form.controls.asset_category_id.value!,
      running_start_no: this.form.controls.running_start_no.value ?? 0,
      running_end_no: this.form.controls.running_end_no.value ?? 0,
      fiscal_asset_year: this.form.controls.fiscal_asset_year.value ?? 67,
      quantity: this.form.controls.quantity.value ?? 1,
      unit_id: this.form.controls.unit_id.value!,
      unit_price: this.form.controls.unit_price.value,
      total_price: this.form.controls.total_price.value,
      useful_life_year: this.form.controls.useful_life_year.value ?? 0,
    };

    console.log('Payload:', payload);
    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetSubItemsService.updateAssetSubItems(this.asset_sub_item_id()!, payload)
      : this.assetSubItemsService.createAssetSubItems(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');

        const procurementRecordId = this.form.controls.asset_id.value;

        this.router.navigate(['/admin/assetsubItems', procurementRecordId]);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    const procurementRecordId = this.form.controls.asset_id.value;

    this.router.navigate(['/admin/assetsubItems', procurementRecordId]);
  }
}
