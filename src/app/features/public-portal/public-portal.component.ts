import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PublicPortalProcurement,
  PublicPortalProject,
  PublicPortalService,
  PublicPortalStaff,
  PublicPortalStaffOverview,
} from './public-portal.service';

@Component({
  selector: 'app-public-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './public-portal.component.html',
})
export class PublicPortalComponent {
  private service = inject(PublicPortalService);

  staffKeyword = '';
  projectKeyword = '';

  activeTab = signal<'staff' | 'project'>('staff');
  staffs = signal<PublicPortalStaff[]>([]);
  selectedStaff = signal<PublicPortalStaffOverview | null>(null);
  selectedProjectProcurements = signal<PublicPortalProcurement[]>([]);
  projects = signal<PublicPortalProject[]>([]);
  loadingStaffs = signal(false);
  loadingProjects = signal(false);
  loadingOverview = signal(false);
  loadingProcurements = signal(false);

  constructor() {
    this.loadProjects();
  }

  searchStaffs() {
    this.loadingStaffs.set(true);
    this.service.searchStaffs(this.staffKeyword).subscribe({
      next: (data) => this.staffs.set(data),
      error: (error) => console.error(error),
      complete: () => this.loadingStaffs.set(false),
    });
  }

  loadStaffOverview(staffId: number) {
    this.loadingOverview.set(true);
    this.service.getStaffOverview(staffId).subscribe({
      next: (data) => this.selectedStaff.set(data),
      error: (error) => console.error(error),
      complete: () => this.loadingOverview.set(false),
    });
  }

  loadProjects() {
    this.loadingProjects.set(true);
    this.service.getProjects(this.projectKeyword, this.staffKeyword).subscribe({
      next: (data) => this.projects.set(data),
      error: (error) => console.error(error),
      complete: () => this.loadingProjects.set(false),
    });
  }

  loadProjectProcurements(projectId: number) {
    this.loadingProcurements.set(true);
    this.service.getProjectProcurements(projectId, this.staffKeyword).subscribe({
      next: (data) => this.selectedProjectProcurements.set(data),
      error: (error) => console.error(error),
      complete: () => this.loadingProcurements.set(false),
    });
  }
}
