import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffAssetDetail,
  PublicPortalStaffAssetItem,
  PublicPortalStaffLookup,
} from '../shared/public-portal.service';

@Component({
  selector: 'app-portal-staff-asset-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './portal-staff-asset-detail.component.html',
})
export class PortalStaffAssetDetailComponent {
  private route = inject(ActivatedRoute);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  assetId = Number(this.route.snapshot.paramMap.get('assetId'));
  withdrawalId = Number(this.route.snapshot.paramMap.get('withdrawalId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  asset = history.state?.asset as PublicPortalStaffAssetItem | undefined;
  loading = signal(false);
  detail = signal<PublicPortalStaffAssetDetail | null>(null);

  constructor() {
    this.loadDetail();
  }

  loadDetail() {
    this.loading.set(true);
    this.service.getStaffAssetDetail(this.staffId, this.assetId, this.withdrawalId).subscribe({
      next: (data) => this.detail.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }
}
