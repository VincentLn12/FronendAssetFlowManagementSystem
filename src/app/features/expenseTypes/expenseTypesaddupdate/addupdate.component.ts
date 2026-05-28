import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { expenseTypes } from '../interface/expenseTypes';
import { ExpensetypesService } from '../service/expenseTypes.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class ExpenseTypesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expensetypesTypesServive = inject(ExpensetypesService);
  private snackbar = inject(SnackbarService);

  expense_type_id = signal<number | null>(null);
  isEditMode = computed(() => this.expense_type_id() !== null);
  name = 'ชื่อประเภทการเบิกจ่าย';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    expense_type_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.expense_type_id.set(id);
      this.loadExpenseTypes(id);
    }
  }

  private loadExpenseTypes(id: number) {
    const stateloadexpenseTypes = history.state?.expenseTypes as expenseTypes | undefined;

    if (stateloadexpenseTypes?.expense_type_id === id) {
      this.patchForm(stateloadexpenseTypes);
      return;
    }

    this.isLoading.set(true);

    this.expensetypesTypesServive
      .getExpenseType(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/expensetypes']);
        },
      });
  }

  private patchForm(exp: expenseTypes) {
    this.form.patchValue({
      expense_type_name: exp.expense_type_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<expenseTypes> = {
      expense_type_id: this.expense_type_id() ?? 0,
      expense_type_name: this.form.controls.expense_type_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.expensetypesTypesServive.updateExpenseTypes(this.expense_type_id()!, payload)
      : this.expensetypesTypesServive.createExpenseTypes(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/expensetypes']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/expensetypes']);
  }
}
