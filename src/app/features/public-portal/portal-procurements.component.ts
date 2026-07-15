import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalProcurementSummary,
  PublicPortalService,
  PublicPortalStaffLookup,
  PublicPortalStaffProject,
} from './public-portal.service';

@Component({
  selector: 'app-portal-procurements',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './portal-procurements.component.html',
})
export class PortalProcurementsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  projectId = Number(this.route.snapshot.paramMap.get('projectId'));
  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  project = history.state?.project as PublicPortalStaffProject | undefined;
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  procurements = signal<PublicPortalProcurementSummary[]>([]);

  constructor() {
    this.loadProcurements();
  }

  loadProcurements() {
    this.loading.set(true);
    this.service.getStaffProcurementsInProject(this.projectId, this.staffId).subscribe({
      next: (data) => this.procurements.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openDetail(procurement: PublicPortalProcurementSummary) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'projects', this.projectId, 'procurements', procurement.procurement_record_id],
      { state: { project: this.project, staff: this.staff, procurement } },
    );
  }
}
