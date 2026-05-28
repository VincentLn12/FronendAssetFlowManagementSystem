import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { budgetsourceTypes } from '../interface/budgetsourceTypes';
import { BudgetsourceService } from '../service/budgetSource.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class BudgetsourcesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budgetsourceService = inject(BudgetsourceService);
  private snackbar = inject(SnackbarService);

  budget_source_id = signal<number | null>(null);
  isEditMode = computed(() => this.budget_source_id() !== null);
  name = 'ชื่องบประมาณ';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    budget_source_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.budget_source_id.set(id);
      this.loadBudgetsources(id);
    }
  }

  private loadBudgetsources(id: number) {
    const stateloadbutg = history.state?.expenseTypes as budgetsourceTypes | undefined;

    if (stateloadbutg?.budget_source_id === id) {
      this.patchForm(stateloadbutg);
      return;
    }

    this.isLoading.set(true);

    this.budgetsourceService
      .getBudgetsource(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/budgetsources']);
        },
      });
  }

  private patchForm(butg: budgetsourceTypes) {
    this.form.patchValue({
      budget_source_name: butg.budget_source_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<budgetsourceTypes> = {
      budget_source_id: this.budget_source_id() ?? 0,
      budget_source_name: this.form.controls.budget_source_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.budgetsourceService.updateBudgetsources(this.budget_source_id()!, payload)
      : this.budgetsourceService.createBudgetsources(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/budgetsources']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/budgetsources']);
  }
}
