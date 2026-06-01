import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { assetItemsdetailsTypes } from '../interface/assetItemsTypes';
import { AssetItemsService } from '../service/assetItems.service';
import { ThaiDatePipe } from '../../../shared/pipes/thai-date-pipe';

@Component({
  selector: 'app-asset-itemdetail',
  standalone: true,
  imports: [CommonModule, ThaiDatePipe],
  templateUrl: './asset-itemdetail.component.html',
})
export class AssetItemdetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetItemsService = inject(AssetItemsService);

  isLoading = signal(false);

  assetItems = signal<assetItemsdetailsTypes | null>(null);
  asset_id = signal<number | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id || !Number.isFinite(id)) {
      this.router.navigate(['/admin/assetItems']);
      return;
    }

    this.asset_id.set(id);
    this.loadAssetItemDetails(id);
  }

  loadAssetItemDetails(id: number) {
    this.isLoading.set(true);

    this.assetItemsService.getAssetItemDetails(id).subscribe({
      next: (details) => {
        this.assetItems.set(details);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching asset item details:', error);
        this.isLoading.set(false);
      },
    });
  }

  cancel() {
    const procurementId = history.state?.procurement_record_id;

    if (!procurementId) {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    this.router.navigate(['/admin/assetItems', procurementId], {
      state: {
        procurementrecord: history.state?.procurementrecord,
      },
    });
  }
}
