import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PrefixesService } from '../service/prefixes.service';
import { prefixesType } from '../interface/prefixesType';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class PrefixesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prefixesService = inject(PrefixesService);
  private snackbar = inject(SnackbarService);

  prefix_id = signal<number | null>(null);
  isEditMode = computed(() => this.prefix_id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขคำนำหน้าชื่อ' : 'เพิ่มคำนำหน้าชื่อ'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    prefix_name: ['', [Validators.required, Validators.minLength(2)]],
    prefix_short_name: [''],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.prefix_id.set(id);
      this.loadPrefixes(id);
    }
  }

  private loadPrefixes(id: number) {
    const statePrefixes = history.state?.prefixes as prefixesType | undefined;

    if (statePrefixes?.prefix_id === id) {
      this.patchForm(statePrefixes);
      return;
    }

    this.isLoading.set(true);

    this.prefixesService
      .getPrefix(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/departments']);
        },
      });
  }

  private patchForm(prefixes: prefixesType) {
    this.form.patchValue({
      prefix_name: prefixes.prefix_name ?? '',
      prefix_short_name: prefixes.prefix_short_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<prefixesType> = {
      prefix_id: this.prefix_id() ?? 0,
      prefix_name: this.form.controls.prefix_name.value.trim(),
      prefix_short_name: this.form.controls.prefix_short_name.value.trim(),
      is_active: true,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.prefixesService.updatePrefixes(this.prefix_id()!, payload)
      : this.prefixesService.createPrefixes(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/prefixes']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/prefixes']);
  }
}
