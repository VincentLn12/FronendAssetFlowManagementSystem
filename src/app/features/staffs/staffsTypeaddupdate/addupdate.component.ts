import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { StaffsService } from '../service/staffsType.service';
import { staffsTypeCreate } from '../interface/staffsType';
import { SelectComponent } from '../../../../shared';
import { PrefixesService } from '../../prefixes/service/prefixes.service';
import { PositionsService } from '../../positions/service/positions.service';
import { DepartmentService } from '../../departments/service/department.service';

@Component({
  selector: 'app-staff-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './addupdate.component.html',
})
export class StaffAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  
  private staffsService = inject(StaffsService);
  private prefixesService = inject(PrefixesService);
  private positionsService = inject(PositionsService);
  private departmentService = inject(DepartmentService);

  // Dropdown data
  prefixes = signal<any[]>([]);
  positions = signal<any[]>([]);
  departments = signal<any[]>([]);

  staff_id = signal<number | null>(null);
  isEditMode = computed(() => this.staff_id() !== null);

  title = computed(() => (this.isEditMode() ? 'แก้ไขบุคลากร' : 'เพิ่มบุคลากร'));

  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(2)]],
    last_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: [''],
    department_id: [null as number | null, Validators.required],
    position_id: [null as number | null, Validators.required],
    prefix_id: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id && Number.isFinite(id)) {
      this.staff_id.set(id);
      this.loadStaff(id);
    }
  }

  private loadStaff(id: number) {
    const stateStaff = history.state?.staff as staffsTypeCreate | undefined;

    if (stateStaff?.staff_id === id) {
      this.patchForm(stateStaff);
      return;
    }

    this.isLoading.set(true);

    this.staffsService
      .getStaff(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (staff) => this.patchForm(staff),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลบุคลากรได้');
          this.router.navigate(['/admin/staffs']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      prefixes: this.prefixesService.getPrefixes({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      positions: this.positionsService.getPositions({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      departments: this.departmentService.getDepartments({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.prefixes.set(res.prefixes.data);
        this.positions.set(res.positions.data);
        this.departments.set(res.departments.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }

  private patchForm(staff: staffsTypeCreate) {
    this.form.patchValue({
      first_name: staff.first_name ?? '',
      last_name: staff.last_name ?? '',
      email: staff.email ?? '',
      phone: staff.phone ?? '',
      department_id: staff.department_id ?? null,
      position_id: staff.position_id ?? null,
      prefix_id: staff.prefix_id ?? null,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const payload: staffsTypeCreate = {
      staff_id: this.staff_id() ?? 0,
      first_name: value.first_name?.trim() ?? '',
      last_name: value.last_name?.trim() ?? '',
      email: value.email?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      department_id: value.department_id!,
      position_id: value.position_id!,
      prefix_id: value.prefix_id!,
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.staffsService.updateStaff(this.staff_id()!, payload)
      : this.staffsService.createStaff(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.snackbar.success(this.isEditMode() ? 'แก้ไขบุคลากรสำเร็จ' : 'เพิ่มบุคลากรสำเร็จ');
        this.router.navigate(['/admin/staffs']);
      },
      error: () => {
        this.snackbar.error(this.isEditMode() ? 'แก้ไขบุคลากรไม่สำเร็จ' : 'เพิ่มบุคลากรไม่สำเร็จ');
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/staffs']);
  }
}
