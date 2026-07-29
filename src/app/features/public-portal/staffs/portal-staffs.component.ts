import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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

  constructor() {
    this.loadStaffs();
  }

  loadStaffs() {
    this.loading.set(true);
    this.service.getStaffs(this.keyword).subscribe({
      next: (data) => this.staffs.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openStaff(staff: PublicPortalStaffLookup) {
    this.router.navigate(['/portal/staffs', staff.staff_id, 'dashboard'], {
      state: { staff },
    });
  }
}
