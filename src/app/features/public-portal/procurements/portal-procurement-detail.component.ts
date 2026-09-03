import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PublicPortalProcurementDetail,
  PublicPortalProcurementSummary,
  PublicPortalService,
  PublicPortalStaffLookup,
  PublicPortalStaffProject,
} from '../shared/public-portal.service';
import { ThaiDatePipe } from '../shared/thai-date.pipe';

@Component({
  selector: 'app-portal-procurement-detail',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, ThaiDatePipe],
  templateUrl: './portal-procurement-detail.component.html',
})
export class PortalProcurementDetailComponent {
  private route = inject(ActivatedRoute);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  procurementId = Number(this.route.snapshot.paramMap.get('procurementId'));
  fiscalYearId = this.route.snapshot.queryParamMap.get('fiscal_year_id');
  project = history.state?.project as PublicPortalStaffProject | undefined;
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  procurement = history.state?.procurement as PublicPortalProcurementSummary | undefined;
  loading = signal(false);
  detail = signal<PublicPortalProcurementDetail | null>(null);

  title = computed(() => {
    const detail = this.detail();
    if (!detail) return 'รายละเอียดเอกสาร';
    if (detail.category === 'วัสดุ') return 'รายการพัสดุในเอกสาร';
    if (detail.category === 'ครุภัณฑ์') return 'ประวัติครุภัณฑ์';
    return 'รายละเอียดรายการจัดจ้าง';
  });

  groupedAssets = computed(() => {
    const detail = this.detail();
    if (!detail || detail.category !== 'ครุภัณฑ์') return [];

    const groups = new Map<
      string,
      {
        asset_name: string;
        withdrawal_document_no: string;
        withdrawal_date: string;
        storage_location?: string | null;
        purpose?: string | null;
        subItems: typeof detail.asset_histories;
      }
    >();

    for (const item of detail.asset_histories) {
      const key = `${item.procurement_withdrawal_id}-${item.asset_name}`;
      const existing = groups.get(key);

      if (existing) {
        existing.subItems.push(item);
      } else {
        groups.set(key, {
          asset_name: item.asset_name,
          withdrawal_document_no: item.withdrawal_document_no,
          withdrawal_date: item.withdrawal_date,
          storage_location: item.storage_location,
          purpose: item.purpose,
          subItems: [item],
        });
      }
    }

    return Array.from(groups.values());
  });

  groupedMaterials = computed(() => {
    const detail = this.detail();
    if (!detail || detail.category !== 'วัสดุ') return [];

    const groups = new Map<
      string,
      {
        material_name: string;
        total_quantity: number;
        items: typeof detail.material_receive_details;
      }
    >();

    for (const item of detail.material_receive_details) {
      const existing = groups.get(item.material_name);

      if (existing) {
        existing.items.push(item);
        existing.total_quantity += item.quantity;
      } else {
        groups.set(item.material_name, {
          material_name: item.material_name,
          total_quantity: item.quantity,
          items: [item],
        });
      }
    }

    return Array.from(groups.values());
  });

  constructor() {
    this.loadDetail();
  }

  loadDetail() {
    this.loading.set(true);
    this.service.getProcurementDetail(this.staffId, this.procurementId).subscribe({
      next: (data) => this.detail.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }
}
