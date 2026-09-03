import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalProcurementSummary,
  PublicPortalService,
  PublicPortalStaffLookup,
} from '../shared/public-portal.service';
import { ThaiDatePipe } from '../shared/thai-date.pipe';

@Component({
  selector: 'app-portal-staff-procurements',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, ThaiDatePipe],
  templateUrl: './portal-staff-procurements.component.html',
})
export class PortalStaffProcurementsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  procurements = signal<PublicPortalProcurementSummary[]>([]);

  constructor() {
    this.loadProcurements();
  }

  loadProcurements() {
    this.loading.set(true);
    this.service.getStaffProcurements(this.staffId).subscribe({
      next: (data) => this.procurements.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openDetail(procurement: PublicPortalProcurementSummary) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'procurements', procurement.procurement_record_id],
      { state: { project: procurement, staff: this.staff, procurement } },
    );
  }
}
