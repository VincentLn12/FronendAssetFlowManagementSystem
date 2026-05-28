import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { fundcategorysTypes } from '../interface/fundcategorysTypes';
import { FundcategorysService } from '../service/fundcategorys.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class FundcategorysAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fundcategorysService = inject(FundcategorysService);
  private snackbar = inject(SnackbarService);

  fund_category_id = signal<number | null>(null);
  isEditMode = computed(() => this.fund_category_id() !== null);
  name = 'ชื่อประเภทหมวดเงิน';

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    fund_code: ['', [Validators.required]],
    fund_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.fund_category_id.set(id);
      this.loadExpenseTypes(id);
    }
  }

  private loadExpenseTypes(id: number) {
    const stateloadexpenseTypes = history.state?.fund as fundcategorysTypes | undefined;

    if (stateloadexpenseTypes?.fund_category_id === id) {
      this.patchForm(stateloadexpenseTypes);
      return;
    }

    this.isLoading.set(true);

    this.fundcategorysService
      .getFundcategory(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/fundcategorys']);
        },
      });
  }

  private patchForm(exp: fundcategorysTypes) {
    this.form.patchValue({
      fund_code: exp.fund_code ?? '',
      fund_name: exp.fund_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<fundcategorysTypes> = {
      fund_category_id: this.fund_category_id() ?? 0,
      fund_code: this.form.controls.fund_code.value.trim(),
      fund_name: this.form.controls.fund_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.fundcategorysService.updateFundcategorys(this.fund_category_id()!, payload)
      : this.fundcategorysService.createFundcategorys(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/fundcategorys']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/fundcategorys']);
  }
}
