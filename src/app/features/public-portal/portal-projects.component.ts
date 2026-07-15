import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicPortalProject, PublicPortalService } from './public-portal.service';

@Component({
  selector: 'app-portal-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './portal-projects.component.html',
})
export class PortalProjectsComponent {
  private service = inject(PublicPortalService);
  private router = inject(Router);

  keyword = '';
  loading = signal(false);
  projects = signal<PublicPortalProject[]>([]);

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.service.getProjects(this.keyword).subscribe({
      next: (data) => this.projects.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  openProject(project: PublicPortalProject) {
    this.router.navigate(['/portal/projects', project.project_id, 'withdrawers'], {
      state: { project },
    });
  }
}
