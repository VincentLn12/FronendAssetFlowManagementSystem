import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalFiscalYear,
  PublicPortalService,
  PublicPortalStaffLookup,
} from '../shared/public-portal.service';

@Component({
  selector: 'app-portal-staff-years',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-staff-years.component.html',
})
export class PortalStaffYearsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  fiscalYears = signal<PublicPortalFiscalYear[]>([]);

  constructor() {
    this.loadFiscalYears();
  }

  loadFiscalYears() {
    this.loading.set(true);
    this.service.getStaffFiscalYears(this.staffId).subscribe({
      next: (data) => this.fiscalYears.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openDashboard(year: PublicPortalFiscalYear) {
    this.router.navigate(['/portal/staffs', this.staffId, 'dashboard'], {
      queryParams: { fiscal_year_id: year.fiscal_year_id },
      state: { staff: this.staff, fiscalYear: year },
    });
  }
}
