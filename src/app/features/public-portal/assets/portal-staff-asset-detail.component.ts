import { CommonModule, DecimalPipe } from '@angular/common';
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
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './portal-staff-asset-detail.component.html',
})
export class PortalStaffAssetDetailComponent {
  private route = inject(ActivatedRoute);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  assetId = Number(this.route.snapshot.paramMap.get('assetId'));
  withdrawalId = Number(this.route.snapshot.paramMap.get('withdrawalId'));
  fiscalYearId = this.route.snapshot.queryParamMap.get('fiscal_year_id');
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  asset = history.state?.asset as PublicPortalStaffAssetItem | undefined;
  loading = signal(false);
  detail = signal<PublicPortalStaffAssetDetail | null>(null);

  // Tab State: 'sub_items' | 'repairs' | 'histories'
  activeTab = signal<'sub_items' | 'repairs' | 'histories'>('sub_items');

  selectTab(tab: 'sub_items' | 'repairs' | 'histories') {
    this.activeTab.set(tab);
  }


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

  formatSubItemAssetCode(subItem: any): string {
    if (!subItem) return '-';

    let prefix = '';
    if (subItem.asset_code_end) {
      const slashIdx = subItem.asset_code_end.indexOf('/');
      const mainPart = slashIdx !== -1 ? subItem.asset_code_end.substring(0, slashIdx) : subItem.asset_code_end;
      const lastHyphen = mainPart.lastIndexOf('-');
      if (lastHyphen !== -1) {
        prefix = mainPart.substring(0, lastHyphen);
      } else {
        prefix = mainPart;
      }
    }

    if (!prefix && this.detail()?.project_code) {
      prefix = this.detail()!.project_code;
    }

    const startNo = subItem.running_start_no;
    const endNo = subItem.running_end_no;
    const year = subItem.fiscal_asset_year;

    if (prefix && startNo && endNo && year) {
      const startStr = this.padZero(startNo);
      const endStr = this.padZero(endNo);
      if (startNo === endNo) {
        return `${prefix}-${startStr}/${year}`;
      } else {
        return `${prefix}-${startStr}-${endStr}/${year}`;
      }
    }

    return subItem.asset_code_end || '-';
  }

  getMasterAssetCode(): string {
    const d = this.detail();
    if (!d) return '-';
    if (d.running_start_no && d.running_end_no && d.fiscal_asset_year) {
      const startStr = this.padZero(d.running_start_no);
      const endStr = this.padZero(d.running_end_no);
      const prefix = d.project_code ? d.project_code + '-' : '';
      if (d.running_start_no === d.running_end_no) {
        return `${prefix}${startStr}/${d.fiscal_asset_year}`;
      }
      return `${prefix}${startStr}-${endStr}/${d.fiscal_asset_year}`;
    }
    return '-';
  }

  toThaiDate(dateStr: string | null | undefined, style: 'short' | 'full' | 'numeric' = 'short'): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate();
    const month = d.getMonth();
    const yearBE = d.getFullYear() + 543;

    if (style === 'numeric') {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${dayStr}/${monthStr}/${yearBE}`;
    }

    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const thaiMonthsFull = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    if (style === 'full') {
      return `${day} ${thaiMonthsFull[month]} ${yearBE}`;
    }

    return `${day} ${thaiMonthsShort[month]} ${yearBE}`;
  }

  private padZero(num: number): string {
    if (!num) return '0000';
    const str = String(num);
    return str.padStart(4, '0');
  }
}


