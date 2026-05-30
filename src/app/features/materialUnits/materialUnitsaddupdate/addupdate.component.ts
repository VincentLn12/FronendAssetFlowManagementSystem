import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { materialUnitsTypes } from '../interface/materialUnitsTypes';
import { MaterialUnitsService } from '../service/materialUnits.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class MaterialUnitsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materialUnitsService = inject(MaterialUnitsService);
  private snackbar = inject(SnackbarService);

  unit_id = signal<number | null>(null);
  isEditMode = computed(() => this.unit_id() !== null);
  name = 'ชื่อหน่วยนับ';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    unit_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.unit_id.set(id);
      this.loadMaterialUnits(id);
    }
  }

  private loadMaterialUnits(id: number) {
    const stateloadexpenseTypes = history.state?.fund as materialUnitsTypes | undefined;

    if (stateloadexpenseTypes?.unit_id === id) {
      this.patchForm(stateloadexpenseTypes);
      return;
    }

    this.isLoading.set(true);

    this.materialUnitsService
      .getMaterialUnit(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/materialUnits']);
        },
      });
  }

  private patchForm(mat: materialUnitsTypes) {
    this.form.patchValue({
      unit_name: mat.unit_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<materialUnitsTypes> = {
      unit_id: this.unit_id() ?? 0,
      unit_name: this.form.controls.unit_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.materialUnitsService.updateMaterialUnits(this.unit_id()!, payload)
      : this.materialUnitsService.createMaterialUnits(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/materialUnits']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/materialUnits']);
  }
}
