import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { assetRepairsTypes } from '../interface/assetRepairsTypes';
import { ThaiDatePipe } from '../../../shared/pipes/thai-date-pipe';

@Component({
  selector: 'app-details',
  imports: [ThaiDatePipe],
  templateUrl: './assetRepairsDetails.component.html',
})
export class AssetRepairsDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);

  assetRepairs = signal<assetRepairsTypes | null>(null);
  asset_repair_id = signal<number | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.asset_repair_id.set(id);

    const stateRecord = history.state?.assetRepairs as assetRepairsTypes | undefined;

    if (stateRecord) {
      this.assetRepairs.set(stateRecord);
      return;
    }

    console.warn('ไม่พบข้อมูลจาก state อาจเกิดจาก refresh หน้า หรือเปิด URL โดยตรง');
  }

  cancel() {
    const assetId = this.assetRepairs()?.asset_id;

    if (!assetId) {
      this.router.navigate(['/admin/procurements']);
      return;
    }

    this.router.navigate(['/admin/assetRepairs', assetId], {
      state: {
        assetItem: history.state?.assetItem,
        procurementrecord: history.state?.procurementrecord,
        procurement_record_id: history.state?.procurement_record_id,
      },
    });
  }
}
