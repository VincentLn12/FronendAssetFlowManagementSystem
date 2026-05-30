import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AssetCategoriesService } from '../service/assetCategories.service';
import { AssetCategoriesTypes } from '../interface/AssetCategoriesTypes';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class AssetCategoriesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetCategoriesService = inject(AssetCategoriesService);
  private snackbar = inject(SnackbarService);

  asset_category_id = signal<number | null>(null);
  isEditMode = computed(() => this.asset_category_id() !== null);
  name = 'ประเภทครุภัณฑ์หลัก';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    category_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.asset_category_id.set(id);
      this.loadAssetCategories(id);
    }
  }

  private loadAssetCategories(id: number) {
    const stateloadAssetCategories = history.state?.assetCategories as
      | AssetCategoriesTypes
      | undefined;

    if (stateloadAssetCategories?.asset_category_id === id) {
      this.patchForm(stateloadAssetCategories);
      return;
    }

    this.isLoading.set(true);

    this.assetCategoriesService
      .getAssetCategorie(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/assetCategorie']);
        },
      });
  }

  private patchForm(opt: AssetCategoriesTypes) {
    this.form.patchValue({
      category_name: opt.category_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<AssetCategoriesTypes> = {
      asset_category_id: this.asset_category_id() ?? 0,
      category_name: this.form.controls.category_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetCategoriesService.updateAssetCategories(this.asset_category_id()!, payload)
      : this.assetCategoriesService.createAssetCategories(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/assetCategorie']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/assetCategorie']);
  }
}
