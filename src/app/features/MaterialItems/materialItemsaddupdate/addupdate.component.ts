import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { materialItemsTypes } from '../interface/materialItemsTypes';
import { MaterialItemsService } from '../service/materialItems.service';
import { MaterialUnitsService } from '../../materialUnits/service/materialUnits.service';
import { SelectComponent, TextareaComponent } from '../../../../shared';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent],
  templateUrl: './addupdate.component.html',
})
export class MaterialItemsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private MaterialItemsService = inject(MaterialItemsService);
  private MaterialUnitsService = inject(MaterialUnitsService);
  private snackbar = inject(SnackbarService);

  material_item_id = signal<number | null>(null);
  isEditMode = computed(() => this.material_item_id() !== null);
  name = 'วัสดุ';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  unit = signal<any[]>([]);

  form = this.fb.nonNullable.group({
    material_code: [''],
    material_name: ['', [Validators.required]],
    specification: [''],
    unit_id: [null as number | null, [Validators.required]],
    unit_price: [0],
    remark: [''],
    min_stock: [0],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.material_item_id.set(id);
      this.loadMaterialItems(id);
    }
  }

  private loadMaterialItems(id: number) {
    const stateloadexpenseTypes = history.state?.fund as materialItemsTypes | undefined;

    if (stateloadexpenseTypes?.material_item_id === id) {
      this.patchForm(stateloadexpenseTypes);
      return;
    }

    this.isLoading.set(true);

    this.MaterialItemsService.getMaterialItem(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/MaterialItems']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      unit: this.MaterialUnitsService.getMaterialUnits({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.unit.set(res.unit.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private patchForm(mat: materialItemsTypes) {
    this.form.patchValue({
      material_code: mat.material_code ?? '',
      material_name: mat.material_name ?? '',
      specification: mat.specification ?? '',
      unit_id: mat.unit_id ?? null,
      unit_price: mat.unit_price ?? 0,
      remark: mat.remark ?? '',
      min_stock: mat.min_stock ?? 0,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();

    const payload: Partial<materialItemsTypes> = {
      material_item_id: this.material_item_id() ?? 0,
      material_code: raw.material_code.trim(),
      material_name: raw.material_name.trim(),
      specification: raw.specification?.trim(),
      unit_id: Number(raw.unit_id),
      unit_price: Number(raw.unit_price),
      remark: raw.remark?.trim(),
      min_stock: Number(raw.min_stock),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.MaterialItemsService.updateMaterialItems(this.material_item_id()!, payload)
      : this.MaterialItemsService.createMaterialItems(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/MaterialItems']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/MaterialItems']);
  }
}
