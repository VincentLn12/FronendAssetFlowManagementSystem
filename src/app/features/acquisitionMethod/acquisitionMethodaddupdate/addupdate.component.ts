import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AcquisitionMethodService } from '../service/acquisitionMethod.service';
import { acquisitionMethodTypes } from '../interface/acquisitionMethodTypes';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class AcquisitionMethodAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private acquisitionMethodService = inject(AcquisitionMethodService);
  private snackbar = inject(SnackbarService);

  acquisition_method_id = signal<number | null>(null);
  isEditMode = computed(() => this.acquisition_method_id() !== null);
  name = 'วิธีการได้มา';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    acquisition_method_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.acquisition_method_id.set(id);
      this.loadAcquisitionMethod(id);
    }
  }

  private loadAcquisitionMethod(id: number) {
    const stateloadAcquisitionMethod = history.state?.AcquisitionMethod as
      | acquisitionMethodTypes
      | undefined;

    if (stateloadAcquisitionMethod?.acquisition_method_id === id) {
      this.patchForm(stateloadAcquisitionMethod);
      return;
    }

    this.isLoading.set(true);

    this.acquisitionMethodService
      .getAcquisitionMethod(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/acquisitionMethod']);
        },
      });
  }

  private patchForm(opt: acquisitionMethodTypes) {
    this.form.patchValue({
      acquisition_method_name: opt.acquisition_method_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<acquisitionMethodTypes> = {
      acquisition_method_id: this.acquisition_method_id() ?? 0,
      acquisition_method_name: this.form.controls.acquisition_method_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.acquisitionMethodService.updateAcquisitionMethod(
          this.acquisition_method_id()!,
          payload,
        )
      : this.acquisitionMethodService.createAcquisitionMethod(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/acquisitionMethod']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/acquisitionMethod']);
  }
}
