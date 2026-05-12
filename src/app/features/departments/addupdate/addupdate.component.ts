import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { DepartmentService } from '../service/department.service';
import { DepartmentType } from '../interface/departmentType';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class AddupdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private departmentService = inject(DepartmentService);
  private snackbar = inject(SnackbarService);

  departmentId = signal<number | null>(null);

  isEditMode = computed(() => this.departmentId() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขหน่วยงาน/สาขาวิชา' : 'เพิ่มหน่วยงาน/สาขาวิชา'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    department_name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.departmentId.set(id);
      this.loadDepartment(id);
    }
  }

  private loadDepartment(id: number) {
    const stateDepartment = history.state?.depart as DepartmentType | undefined;

    if (stateDepartment?.department_id === id) {
      this.patchForm(stateDepartment);
      return;
    }

    this.isLoading.set(true);

    this.departmentService
      .getDepartment(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (department) => this.patchForm(department),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/departments']);
        },
      });
  }

  private patchForm(department: DepartmentType) {
    this.form.patchValue({
      department_name: department.department_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<DepartmentType> = {
      department_id: this.departmentId() ?? 0,
      department_name: this.form.controls.department_name.value.trim(),
      is_active: true,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.departmentService.updateDepartment(this.departmentId()!, payload)
      : this.departmentService.createDepartment(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/departments']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/departments']);
  }
}
