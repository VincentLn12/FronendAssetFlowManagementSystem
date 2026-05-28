import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { OperationsTypeService } from '../service/operationTypes.service';
import { OperationTypes } from '../interface/operationTypes';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class OperationTypesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationTypesServive = inject(OperationsTypeService);
  private snackbar = inject(SnackbarService);

  operation_type_id = signal<number | null>(null);
  isEditMode = computed(() => this.operation_type_id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขตำเเหน่งบุคลากร' : 'เพิ่มตำเเหน่งบุคลากร'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    operation_type_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.operation_type_id.set(id);
      this.loadOperationTypes(id);
    }
  }

  private loadOperationTypes(id: number) {
    const stateloadOperationTypes = history.state?.prefixes as OperationTypes | undefined;

    if (stateloadOperationTypes?.operation_type_id === id) {
      this.patchForm(stateloadOperationTypes);
      return;
    }

    this.isLoading.set(true);

    this.operationTypesServive
      .getOperationtype(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/OperationTypes']);
        },
      });
  }

  private patchForm(opt: OperationTypes) {
    this.form.patchValue({
      operation_type_name: opt.operation_type_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<OperationTypes> = {
      operation_type_id: this.operation_type_id() ?? 0,
      operation_type_name: this.form.controls.operation_type_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.operationTypesServive.updateOperationtypes(this.operation_type_id()!, payload)
      : this.operationTypesServive.createOperationtypes(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/OperationTypes']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/OperationTypes']);
  }
}
