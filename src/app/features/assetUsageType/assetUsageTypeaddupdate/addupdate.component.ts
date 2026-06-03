import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AssetUsageTypeService } from '../service/assetUsageType.service';
import { assetUsageType } from '../interface/assetUsageType';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class AssetUsageTypeAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetUsageTypeService = inject(AssetUsageTypeService);
  private snackbar = inject(SnackbarService);

  usage_type_id = signal<number | null>(null);
  isEditMode = computed(() => this.usage_type_id() !== null);
  name = 'ประเภทการใช้งานครุภัณฑ์';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    usage_type_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.usage_type_id.set(id);
      this.loadassetUsageType(id);
    }
  }

  private loadassetUsageType(id: number) {
    const stateloadassetUsageType = history.state?.assetUsageType as assetUsageType | undefined;

    if (stateloadassetUsageType?.usage_type_id === id) {
      this.patchForm(stateloadassetUsageType);
      return;
    }

    this.isLoading.set(true);

    this.assetUsageTypeService
      .getAssetUsageType(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/assetUsageType']);
        },
      });
  }

  private patchForm(opt: assetUsageType) {
    this.form.patchValue({
      usage_type_name: opt.usage_type_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<assetUsageType> = {
      usage_type_id: this.usage_type_id() ?? 0,
      usage_type_name: this.form.controls.usage_type_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.assetUsageTypeService.updateAssetUsageTypes(this.usage_type_id()!, payload)
      : this.assetUsageTypeService.createAssetUsageTypes(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/assetUsageType']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/assetUsageType']);
  }
}
