import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { RolesService } from '../service/roles.service';
import { rolecreateType } from '../interface/roleType';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './addupdate.component.html',
})
export class RolesAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rolesServive = inject(RolesService);
  private snackbar = inject(SnackbarService);

  id = signal<string | null>(null);
  isEditMode = computed(() => this.id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขบทบาท' : 'เพิ่มบทบาท'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? String(idParam) : null;

    if (id && String(id)) {
      this.id.set(id);
      this.loadRole(id);
    }
  }

  private loadRole(id: string) {
    const stateRole = history.state?.roles as rolecreateType | undefined;

    if (stateRole?.id === id) {
      this.patchForm(stateRole);
      return;
    }

    this.isLoading.set(true);

    this.rolesServive
      .getRole(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/roles']);
        },
      });
  }

  private patchForm(roles: rolecreateType) {
    this.form.patchValue({
      name: roles.name ?? '',
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<rolecreateType> = {
      id: this.id() ?? undefined,
      name: this.form.controls.name.value.trim(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.rolesServive.updateRoles(this.id()!, payload)
      : this.rolesServive.createRoles(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
        this.router.navigate(['/admin/roles']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/roles']);
  }
}
