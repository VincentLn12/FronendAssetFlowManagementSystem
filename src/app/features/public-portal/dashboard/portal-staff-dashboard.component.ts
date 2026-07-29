import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffLookup,
  PublicPortalStaffSummary,
  PublicPortalProcurementSummary,
  PublicPortalStaffAssetItem,
  PublicPortalFiscalYear,
  PublicPortalMaterialWithdrawalHistory,
} from '../shared/public-portal.service';

@Component({
  selector: 'app-portal-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './portal-staff-dashboard.component.html',
})
export class PortalStaffDashboardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PublicPortalService);

  staffId = Number(this.route.snapshot.paramMap.get('staffId'));
  staff = history.state?.staff as PublicPortalStaffLookup | undefined;
  fiscalYearId: number | null = this.getFiscalYearId();
  fiscalYear = history.state?.fiscalYear as { fiscal_year?: number; year_name?: string | null } | undefined;
  loading = signal(false);
  loadingYears = signal(false);
  selectedSection = signal<'procurements' | 'materials' | 'assets' | null>(null);
  searchQuery = signal('');

  summary = signal<PublicPortalStaffSummary | null>(null);
  procurements = signal<PublicPortalProcurementSummary[]>([]);
  materialWithdrawals = signal<PublicPortalMaterialWithdrawalHistory[]>([]);
  assets = signal<PublicPortalStaffAssetItem[]>([]);
  fiscalYears = signal<PublicPortalFiscalYear[]>([]);

  // Client-side search filters
  filteredProcurements = computed(() => {
    const list = this.procurements();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;
    return list.filter(
      (p) =>
        p.document_no.toLowerCase().includes(query) ||
        (p.project_name && p.project_name.toLowerCase().includes(query)) ||
        (p.project_code && p.project_code.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.expense_type_name && p.expense_type_name.toLowerCase().includes(query))
    );
  });

  filteredAssets = computed(() => {
    const list = this.assets();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;
    return list.filter(
      (a) =>
        a.asset_name.toLowerCase().includes(query) ||
        a.document_no.toLowerCase().includes(query) ||
        (a.storage_location && a.storage_location.toLowerCase().includes(query)) ||
        (a.project_name && a.project_name.toLowerCase().includes(query))
    );
  });

  filteredMaterialWithdrawals = computed(() => {
    const list = this.materialWithdrawals();
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;
    return list.filter(
      (item) =>
        item.material_name.toLowerCase().includes(query) ||
        item.document_no.toLowerCase().includes(query) ||
        item.withdrawal_document_no.toLowerCase().includes(query) ||
        (item.material_code && item.material_code.toLowerCase().includes(query)) ||
        (item.project_name && item.project_name.toLowerCase().includes(query)) ||
        (item.project_code && item.project_code.toLowerCase().includes(query))
    );
  });

  constructor() {
    if (this.fiscalYearId) {
      this.loadData();
    } else {
      this.loadFiscalYears();
    }
  }

  loadFiscalYears() {
    this.loadingYears.set(true);
    this.service.getStaffFiscalYears(this.staffId).subscribe({
      next: (data) => this.fiscalYears.set(data),
      error: (error) => console.error(error),
      complete: () => this.loadingYears.set(false),
    });
  }

  selectFiscalYear(year: PublicPortalFiscalYear) {
    this.fiscalYearId = year.fiscal_year_id;
    this.fiscalYear = year;
    this.searchQuery.set('');
    this.summary.set(null);
    this.procurements.set([]);
    this.materialWithdrawals.set([]);
    this.assets.set([]);

    this.router.navigate(['/portal/staffs', this.staffId, 'dashboard'], {
      queryParams: { fiscal_year_id: year.fiscal_year_id },
      state: { staff: this.staff, fiscalYear: year },
    });

    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    // Fetch summary
    this.service.getStaffSummary(this.staffId, this.fiscalYearId).subscribe({
      next: (data) => this.summary.set(data),
      error: (error) => console.error(error),
    });

    // Fetch procurements
    this.service.getStaffProcurements(this.staffId, this.fiscalYearId).subscribe({
      next: (data) => this.procurements.set(data),
      error: (error) => console.error(error),
    });

    this.service.getStaffMaterialWithdrawals(this.staffId, this.fiscalYearId).subscribe({
      next: (data) => this.materialWithdrawals.set(data),
      error: (error) => console.error(error),
    });

    // Fetch assets
    this.service.getStaffAssets(this.staffId, this.fiscalYearId).subscribe({
      next: (data) => this.assets.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  selectSection(section: 'procurements' | 'materials' | 'assets') {
    this.selectedSection.set(section);
    this.searchQuery.set('');
  }

  clearSection() {
    this.selectedSection.set(null);
    this.searchQuery.set('');
  }

  openProcurementDetail(procurement: PublicPortalProcurementSummary) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'procurements', procurement.procurement_record_id],
      {
        queryParams: this.fiscalYearId ? { fiscal_year_id: this.fiscalYearId } : {},
        state: { project: procurement, staff: this.staff || this.summary(), procurement },
      }
    );
  }

  openAssetDetail(asset: PublicPortalStaffAssetItem) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'assets', asset.asset_id, 'withdrawals', asset.procurement_withdrawal_id],
      {
        queryParams: this.fiscalYearId ? { fiscal_year_id: this.fiscalYearId } : {},
        state: { staff: this.staff || this.summary(), asset },
      }
    );
  }

  private getFiscalYearId() {
    const value =
      this.route.snapshot.queryParamMap.get('fiscal_year_id') ??
      this.route.snapshot.queryParamMap.get('fiscalYearId');
    const fiscalYearId = value ? Number(value) : null;
    return fiscalYearId && Number.isFinite(fiscalYearId) && fiscalYearId > 0 ? fiscalYearId : null;
  }
}
