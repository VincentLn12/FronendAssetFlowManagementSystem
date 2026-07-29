import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface PublicPortalProject {
  project_id: number;
  project_code: string;
  project_name: string;
  project_budget_amount: number;
  procurement_count: number;
  withdrawer_count: number;
}

export interface PublicPortalStaffLookup {
  staff_id: number;
  full_name: string;
  department_name?: string | null;
  project_count: number;
  material_withdrawal_count: number;
  asset_withdrawal_count: number;
}

export interface PublicPortalFiscalYear {
  fiscal_year_id: number;
  fiscal_year: number;
  year_name?: string | null;
}

export interface PublicPortalStaffProject {
  project_id: number;
  project_code: string;
  project_name: string;
  project_budget_amount: number;
  procurement_count: number;
  material_withdrawal_count: number;
  asset_withdrawal_count: number;
}

export interface PublicPortalStaffSummary {
  staff_id: number;
  full_name: string;
  department_name?: string | null;
  procurement_count: number;
  project_count: number;
  material_withdrawal_count: number;
  asset_withdrawal_count: number;
  asset_holding_count: number;
}

export interface PublicPortalWithdrawer {
  staff_id: number;
  full_name: string;
  department_name?: string | null;
  material_withdrawal_count: number;
  asset_withdrawal_count: number;
}

export interface PublicPortalProcurementSummary {
  procurement_record_id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  document_no: string;
  document_date?: string | null;
  status: string;
  total_amount: number;
  department_name?: string | null;
  expense_type_name: string;
  category: string;
  material_issue_count: number;
  asset_item_count: number;
  asset_sub_item_count: number;
  hire_detail_count: number;
}

export interface PublicPortalStaffAssetItem {
  asset_id: number;
  procurement_withdrawal_id: number;
  procurement_record_id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  document_no: string;
  document_date?: string | null;
  department_name?: string | null;
  withdrawal_document_no: string;
  withdrawal_date: string;
  end_date?: string | null;
  end_reason?: string | null;
  asset_name: string;
  receive_date: string;
  storage_location?: string | null;
  purpose?: string | null;
  running_start_no?: number | null;
  running_end_no?: number | null;
  fiscal_asset_year?: number | null;
  sub_item_count: number;
  history_count: number;
  repair_count: number;
}

export interface PublicPortalMaterialWithdrawalHistory {
  issue_detail_id: number;
  material_withdrawal_id?: number | null;
  procurement_record_id: number;
  material_item_id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  document_no: string;
  document_date?: string | null;
  withdrawal_document_no: string;
  issue_date?: string | null;
  material_code: string;
  material_name: string;
  unit_name?: string | null;
  quantity: number;
  unit_price: number;
  total_amount?: number | null;
  remark?: string | null;
}

export interface PublicPortalAssetSubItem {
  asset_sub_item_id: number;
  sub_item_name: string;
  running_start_no: number;
  running_end_no: number;
  fiscal_asset_year: number;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
}

export interface PublicPortalAssetUsageHistory {
  sub_item_history_id: number;
  history_date: string;
  history_type: string;
  usage_type_name?: string | null;
  detail?: string | null;
  full_name?: string | null;
}

export interface PublicPortalAssetRepair {
  asset_repair_id: number;
  repair_document_no: string;
  repair_date: string;
  status: string;
  problem_description?: string | null;
  repair_description?: string | null;
  repair_shop_name?: string | null;
  repair_cost?: number | null;
  decree_document_no?: string | null;
  full_name?: string | null;
}

export interface PublicPortalStaffAssetDetail {
  asset_id: number;
  procurement_withdrawal_id: number;
  procurement_record_id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  document_no: string;
  document_date?: string | null;
  department_name?: string | null;
  withdrawal_document_no: string;
  withdrawal_date: string;
  end_date?: string | null;
  end_reason?: string | null;
  asset_name: string;
  receive_date: string;
  storage_location?: string | null;
  purpose?: string | null;
  running_start_no?: number | null;
  running_end_no?: number | null;
  fiscal_asset_year?: number | null;
  sub_items: PublicPortalAssetSubItem[];
  histories: PublicPortalAssetUsageHistory[];
  repairs: PublicPortalAssetRepair[];
}

export interface PublicPortalMaterialReceiveDetail {
  receive_detail_id: number;
  item_no: number;
  procurement_record_id: number;
  material_item_id: number;
  material_name: string;
  quantity: number;
  unit_price: number;
  total_amount?: number | null;
  operation_reason?: string | null;
}

export interface PublicPortalAssetHistory {
  procurement_withdrawal_id: number;
  withdrawal_document_no: string;
  withdrawal_date: string;
  end_date?: string | null;
  end_reason?: string | null;
  asset_name: string;
  sub_item_name: string;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
  storage_location?: string | null;
  purpose?: string | null;
}

export interface PublicPortalHireDetail {
  hire_detail_id: number;
  item_no: number;
  hire_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  operation_reason?: string | null;
  remark?: string | null;
}

export interface PublicPortalProcurementDetail {
  procurement_record_id: number;
  document_no: string;
  document_date?: string | null;
  status: string;
  total_amount: number;
  expense_type_name: string;
  category: string;
  material_receive_details: PublicPortalMaterialReceiveDetail[];
  asset_histories: PublicPortalAssetHistory[];
  hire_details: PublicPortalHireDetail[];
}

@Injectable({ providedIn: 'root' })
export class PublicPortalService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + 'PublicPortal/';

  getStaffs(search?: string) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<PublicPortalStaffLookup[]>(this.baseUrl + 'staffs', { params });
  }

  getStaffFiscalYears(staffId: number) {
    return this.http.get<PublicPortalFiscalYear[]>(this.baseUrl + `staffs/${staffId}/fiscal-years`);
  }

  getProjectsByStaff(staffId: number) {
    return this.http.get<PublicPortalStaffProject[]>(this.baseUrl + `staffs/${staffId}/projects`);
  }

  getStaffSummary(staffId: number, fiscalYearId?: number | null) {
    return this.http.get<PublicPortalStaffSummary>(this.baseUrl + `staffs/${staffId}/summary`, {
      params: this.createFiscalYearParams(fiscalYearId),
    });
  }

  getProjects(search?: string) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<PublicPortalProject[]>(this.baseUrl + 'projects', { params });
  }

  getProjectWithdrawers(projectId: number) {
    return this.http.get<PublicPortalWithdrawer[]>(this.baseUrl + `projects/${projectId}/withdrawers`);
  }

  getStaffProcurementsInProject(projectId: number, staffId: number) {
    return this.http.get<PublicPortalProcurementSummary[]>(
      this.baseUrl + `projects/${projectId}/staffs/${staffId}/procurements`,
    );
  }

  getStaffProcurements(staffId: number, fiscalYearId?: number | null) {
    return this.http.get<PublicPortalProcurementSummary[]>(
      this.baseUrl + `staffs/${staffId}/procurements`,
      { params: this.createFiscalYearParams(fiscalYearId) },
    );
  }

  getStaffAssets(staffId: number, fiscalYearId?: number | null) {
    return this.http.get<PublicPortalStaffAssetItem[]>(this.baseUrl + `staffs/${staffId}/assets`, {
      params: this.createFiscalYearParams(fiscalYearId),
    });
  }

  getStaffMaterialWithdrawals(staffId: number, fiscalYearId?: number | null) {
    return this.http.get<PublicPortalMaterialWithdrawalHistory[]>(
      this.baseUrl + `staffs/${staffId}/material-withdrawals`,
      { params: this.createFiscalYearParams(fiscalYearId) },
    );
  }

  getStaffAssetDetail(staffId: number, assetId: number, withdrawalId: number) {
    return this.http.get<PublicPortalStaffAssetDetail>(
      this.baseUrl + `staffs/${staffId}/assets/${assetId}/withdrawals/${withdrawalId}`,
    );
  }

  getProcurementDetail(staffId: number, procurementId: number) {
    return this.http.get<PublicPortalProcurementDetail>(
      this.baseUrl + `staffs/${staffId}/procurements/${procurementId}`,
    );
  }

  private createFiscalYearParams(fiscalYearId?: number | null) {
    let params = new HttpParams();
    if (fiscalYearId && fiscalYearId > 0) {
      params = params.set('fiscalYearId', fiscalYearId);
    }
    return params;
  }
}
