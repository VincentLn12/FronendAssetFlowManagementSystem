import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { InputComponent } from '../../../../shared/input/input.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ProjectAddUpdateDto } from '../interface/projectsTypes';
import { ProjectsService } from '../service/projects.service';
import { SelectComponent } from '../../../../shared';
import { FiscalyearsService } from '../../fiscalyears/service/fiscalyears.service';
import { StaffsService } from '../../staffs/service/staffsType.service';

@Component({
  selector: 'app-addupdate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent],
  templateUrl: './addupdate.component.html',
})
export class ProjectsAddUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  private projectsService = inject(ProjectsService);
  private fiscalyearsService = inject(FiscalyearsService);
  private staffsService = inject(StaffsService);

  project_id = signal<number | null>(null);
  isEditMode = computed(() => this.project_id() !== null);
  name = 'ชือโครงการ';
  selectedFile: File | null = null;

  fiscal_years = signal<any[]>([]);
  staffs = signal<any[]>([]);

  title = computed(() => (this.isEditMode() ? `แก้ไข${this.name}` : `เพิ่ม${this.name}`));
  isLoading = signal(false);  
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    project_code: ['', [Validators.required]],
    project_name: [''],
    fiscal_year_id: [null as number | null, Validators.required],
    project_budget_amount: [0, [Validators.required, Validators.min(0)]],
    staff_id: [null as number | null],
    filePath: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id && Number.isFinite(id)) {
      this.project_id.set(id);
      this.loadProjects(id);
    }
  }

  private loadProjects(id: number) {
    const stateloadProjects = history.state?.projects as ProjectAddUpdateDto | undefined;

    if (stateloadProjects?.project_id === id) {
      this.patchForm(stateloadProjects);
      return;
    }

    this.isLoading.set(true);

    this.projectsService
      .getProject(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (prefixes) => this.patchForm(prefixes),
        error: () => {
          this.snackbar.error('ไม่สามารถโหลดข้อมูลได้');
          this.router.navigate(['/admin/projects']);
        },
      });
  }

  private loadDropdowns() {
    forkJoin({
      fiscal_year: this.fiscalyearsService.getFiscalyears({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
      staff: this.staffsService.getStaffs({
        sort: '',
        search: '',
        pageSize: 100,
        pageNumber: 1,
      }),
    }).subscribe({
      next: (res) => {
        this.fiscal_years.set(res.fiscal_year.data);
        this.staffs.set(res.staff.data);
      },
      error: () => {
        this.snackbar.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
      },
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    this.selectedFile = input.files[0];
  }

  private patchForm(exp: ProjectAddUpdateDto) {
    this.form.patchValue({
      project_code: exp.project_code,
      project_name: exp.project_name,
      fiscal_year_id: exp.fiscal_year_id,
      project_budget_amount: exp.project_budget_amount,
      staff_id: exp.staff_id,
      filePath: exp.filePath,
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const saveProject = (filePath?: string) => {
      const payload: Partial<ProjectAddUpdateDto> = {
        project_id: this.project_id() ?? 0,
        project_code: this.form.value.project_code!,
        project_name: this.form.value.project_name!,
        fiscal_year_id: this.form.value.fiscal_year_id!,
        project_budget_amount: this.form.value.project_budget_amount!,
        staff_id: this.form.value.staff_id!,
        filePath: filePath ?? this.form.value.filePath ?? '',
      };

      const request$ = this.isEditMode()
        ? this.projectsService.updateProjects(this.project_id()!, payload)
        : this.projectsService.createProjects(payload);

      request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
        next: () => {
          this.snackbar.success(this.isEditMode() ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
          this.router.navigate(['/admin/projects']);
        },
        error: () => {
          this.snackbar.error(this.isEditMode() ? 'แก้ไขข้อมูลไม่สำเร็จ' : 'เพิ่มข้อมูลไม่สำเร็จ');
        },
      });
    };

    if (this.selectedFile) {
      this.projectsService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          saveProject(res.filePath);
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.isSubmitting.set(false);
          this.snackbar.error('อัปโหลดไฟล์ไม่สำเร็จ');
        },
      });
    } else {
      saveProject();
    }
  }

  cancel() {
    this.router.navigate(['/admin/projects']);
  }
}
