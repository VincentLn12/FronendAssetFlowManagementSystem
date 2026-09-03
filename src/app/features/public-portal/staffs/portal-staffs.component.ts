import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicPortalService, PublicPortalStaffLookup } from '../shared/public-portal.service';

@Component({
  selector: 'app-portal-staffs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portal-staffs.component.html',
})
export class PortalStaffsComponent {
  private service = inject(PublicPortalService);
  private router = inject(Router);

  keyword = '';
  loading = signal(false);
  staffs = signal<PublicPortalStaffLookup[]>([]);
  selectedDepartment = signal<string>('ทั้งหมด');
  viewMode = signal<'grid' | 'list'>('grid');

  // Computed unique list of departments for filter chips
  departments = computed(() => {
    const list = this.staffs()
      .map((s) => s.department_name?.trim())
      .filter((dept): dept is string => !!dept);
    return ['ทั้งหมด', ...Array.from(new Set(list))];
  });

  // Filtered staff members based on selected department
  filteredStaffs = computed(() => {
    const dept = this.selectedDepartment();
    if (dept === 'ทั้งหมด') {
      return this.staffs();
    }
    return this.staffs().filter((s) => (s.department_name || 'ไม่ระบุหน่วยงาน') === dept);
  });

  // Aggregate stats across loaded staff members
  totalStaffCount = computed(() => this.staffs().length);
  totalDepartmentCount = computed(() => Math.max(0, this.departments().length - 1));
  totalProjects = computed(() =>
    this.staffs().reduce((acc, s) => acc + (s.project_count || 0), 0),
  );
  totalMaterials = computed(() =>
    this.staffs().reduce((acc, s) => acc + (s.material_withdrawal_count || 0), 0),
  );
  totalAssets = computed(() =>
    this.staffs().reduce((acc, s) => acc + (s.asset_withdrawal_count || 0), 0),
  );

  constructor() {
    this.loadStaffs();
  }

  loadStaffs() {
    this.loading.set(true);
    this.service.getStaffs(this.keyword).subscribe({
      next: (data) => {
        this.staffs.set(data);
        // Reset department filter if current selected department no longer exists
        if (
          this.selectedDepartment() !== 'ทั้งหมด' &&
          !data.some((s) => s.department_name === this.selectedDepartment())
        ) {
          this.selectedDepartment.set('ทั้งหมด');
        }
      },
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  selectDepartment(dept: string) {
    this.selectedDepartment.set(dept);
  }

  clearSearch() {
    this.keyword = '';
    this.selectedDepartment.set('ทั้งหมด');
    this.loadStaffs();
  }

  openStaff(staff: PublicPortalStaffLookup) {
    this.router.navigate(['/portal/staffs', staff.staff_id, 'dashboard'], {
      state: { staff },
    });
  }
}

