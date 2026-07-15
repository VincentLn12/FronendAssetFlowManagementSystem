import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicPortalProject, PublicPortalService, PublicPortalWithdrawer } from './public-portal.service';

@Component({
  selector: 'app-portal-withdrawers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal-withdrawers.component.html',
})
export class PortalWithdrawersComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  projectId = Number(this.route.snapshot.paramMap.get('projectId'));
  project = history.state?.project as PublicPortalProject | undefined;
  loading = signal(false);
  withdrawers = signal<PublicPortalWithdrawer[]>([]);

  constructor() {
    this.loadWithdrawers();
  }

  loadWithdrawers() {
    this.loading.set(true);
    this.service.getProjectWithdrawers(this.projectId).subscribe({
      next: (data) => this.withdrawers.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openWithdrawer(withdrawer: PublicPortalWithdrawer) {
    this.router.navigate(['/portal/projects', this.projectId, 'withdrawers', withdrawer.staff_id, 'procurements'], {
      state: { project: this.project, withdrawer },
    });
  }
}
