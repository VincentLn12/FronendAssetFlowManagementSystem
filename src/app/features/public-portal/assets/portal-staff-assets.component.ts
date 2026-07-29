import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffAssetItem,
  PublicPortalStaffLookup,
} from '../shared/public-portal.service';

@Component({
  selector: 'app-portal-staff-assets',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './portal-staff-assets.component.html',
})
export class PortalStaffAssetsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  loading = signal(false);
  assets = signal<PublicPortalStaffAssetItem[]>([]);

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

  openAsset(asset: PublicPortalStaffAssetItem) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'assets', asset.asset_id, 'withdrawals', asset.procurement_withdrawal_id],
      { state: { staff: this.staff, asset } },
    );
  }
}
