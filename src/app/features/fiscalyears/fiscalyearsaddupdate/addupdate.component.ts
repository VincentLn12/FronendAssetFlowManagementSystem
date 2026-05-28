import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { FiscalyearsService } from '../service/fiscalyears.service';
import { fiscalyearsType } from '../interface/fiscalyearsType';
import { DatePickerComponent } from '../../../shared/date-picker/date-picker.component';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, DatePickerComponent],
  templateUrl: './addupdate.component.html',
})
export class FiscalyearsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fiscalyearsServive = inject(FiscalyearsService);
  private snackbar = inject(SnackbarService);

  fiscal_year_id = signal<number | null>(null);
  isEditMode = computed(() => this.fiscal_year_id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขปีงบประมาณ' : 'เพิ่มปีงบประมาณ'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    fiscal_year: [0, [Validators.required]],
    year_name: ['', [Validators.required]],
    start_date: [new Date(), [Validators.required]],
    end_date: [new Date(), [Validators.required]],
    is_closed: [false, [Validators.required]],
  });

  private formatDate(date: any): string {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.fiscal_year_id.set(id);
      this.loadFiscalyears(id);
    }
  }

  private loadFiscalyears(id: number) {
    const statePrefixes = history.state?.prefixes as fiscalyearsType | undefined;

    if (statePrefixes?.fiscal_year_id === id) {
      this.patchForm(statePrefixes);
      return;
    }

    this.isLoading.set(true);

    this.fiscalyearsServive
      .getFiscalyear(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (year) => this.patchForm(year),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/departments']);
        },
      });
  }

  private patchForm(year: fiscalyearsType) {
    this.form.patchValue({
      fiscal_year: year.fiscal_year ?? 0,
      year_name: year.year_name ?? '',
      start_date: year.start_date ? new Date(year.start_date) : new Date(),
      end_date: year.end_date ? new Date(year.end_date) : new Date(),
      is_closed: year.is_closed ?? false,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<fiscalyearsType> = {
      fiscal_year_id: this.fiscal_year_id() ?? 0,
      fiscal_year: this.form.controls.fiscal_year.value,
      year_name: this.form.controls.year_name.value.trim(),
      start_date: this.formatDate(this.form.controls.start_date.value),
      end_date: this.formatDate(this.form.controls.end_date.value),
      is_closed: this.form.controls.is_closed.value,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.fiscalyearsServive.updateFiscalyears(this.fiscal_year_id()!, payload)
      : this.fiscalyearsServive.createFiscalyears(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/fiscalyears']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/fiscalyears']);
  }
}
