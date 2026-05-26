import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PositionsService } from '../service/positions.service';
import { positionsType } from '../interface/positionsType';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class PositionsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private prositionsServive = inject(PositionsService);
  private snackbar = inject(SnackbarService);

  position_id = signal<number | null>(null);
  isEditMode = computed(() => this.position_id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขตำเเหน่งบุคลากร' : 'เพิ่มตำเเหน่งบุคลากร'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    position_name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.position_id.set(id);
      this.loadPositions(id);
    }
  }

  private loadPositions(id: number) {
    const statePrefixes = history.state?.prefixes as positionsType | undefined;

    if (statePrefixes?.position_id === id) {
      this.patchForm(statePrefixes);
      return;
    }

    this.isLoading.set(true);

    this.prositionsServive
      .getPosition(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/departments']);
        },
      });
  }

  private patchForm(posiontions: positionsType) {
    this.form.patchValue({
      position_name: posiontions.position_name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<positionsType> = {
      position_id: this.position_id() ?? 0,
      position_name: this.form.controls.position_name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.prositionsServive.updatePositions(this.position_id()!, payload)
      : this.prositionsServive.createPositions(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/positions']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/positions']);
  }
}
