import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffLookup,
  PublicPortalStaffProject,
} from './public-portal.service';

@Component({
  selector: 'app-portal-staff-projects',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './portal-staff-projects.component.html',
})
export class PortalStaffProjectsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  projects = signal<PublicPortalStaffProject[]>([]);

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.service.getProjectsByStaff(this.staffId).subscribe({
      next: (data) => this.projects.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openProject(project: PublicPortalStaffProject) {
    this.router.navigate(['/portal/staffs', this.staffId, 'projects', project.project_id, 'procurements'], {
      state: { staff: this.staff, project },
    });
  }
}
