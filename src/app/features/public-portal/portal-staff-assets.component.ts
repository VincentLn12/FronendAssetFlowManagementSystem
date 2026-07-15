import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffAssetHolding,
  PublicPortalStaffLookup,
} from './public-portal.service';

@Component({
  selector: 'app-portal-staff-assets',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './portal-staff-assets.component.html',
})
export class PortalStaffAssetsComponent {
  private route = inject(ActivatedRoute);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  assets = signal<PublicPortalStaffAssetHolding[]>([]);

  constructor() {
    this.loadAssets();
  }

  loadAssets() {
    this.loading.set(true);
    this.service.getStaffAssets(this.staffId).subscribe({
      next: (data) => this.assets.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }
}
