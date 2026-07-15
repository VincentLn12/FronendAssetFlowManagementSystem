import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  PublicPortalService,
  PublicPortalStaffLookup,
  PublicPortalStaffSummary,
  PublicPortalProcurementSummary,
  PublicPortalStaffAssetHolding,
} from './public-portal.service';

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
  loading = signal(false);
  activeTab = signal<'procurements' | 'assets'>('procurements');
  searchQuery = signal('');

  summary = signal<PublicPortalStaffSummary | null>(null);
  procurements = signal<PublicPortalProcurementSummary[]>([]);
  assets = signal<PublicPortalStaffAssetHolding[]>([]);

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
        a.sub_item_name.toLowerCase().includes(query) ||
        a.document_no.toLowerCase().includes(query) ||
        (a.storage_location && a.storage_location.toLowerCase().includes(query)) ||
        (a.project_name && a.project_name.toLowerCase().includes(query))
    );
  });

  constructor() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    // Fetch summary
    this.service.getStaffSummary(this.staffId).subscribe({
      next: (data) => this.summary.set(data),
      error: (error) => console.error(error),
    });

    // Fetch procurements
    this.service.getStaffProcurements(this.staffId).subscribe({
      next: (data) => this.procurements.set(data),
      error: (error) => console.error(error),
    });

    // Fetch assets
    this.service.getStaffAssets(this.staffId).subscribe({
      next: (data) => this.assets.set(data),
      error: (error) => console.error(error),
      complete: () => this.loading.set(false),
    });
  }

  setTab(tab: 'procurements' | 'assets') {
    this.activeTab.set(tab);
    this.searchQuery.set(''); // Clear search on tab switch
  }

  openProcurementDetail(procurement: PublicPortalProcurementSummary) {
    this.router.navigate(
      ['/portal/staffs', this.staffId, 'procurements', procurement.procurement_record_id],
      { state: { project: procurement, staff: this.staff || this.summary(), procurement } }
    );
  }
}

