import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

export interface PublicPortalStaffAssetHolding {
  procurement_record_id: number;
  project_id: number;
  project_code: string;
  project_name: string;
  document_no: string;
  document_date?: string | null;
  department_name?: string | null;
  withdrawal_document_no: string;
  withdrawal_date: string;
  asset_name: string;
  sub_item_name: string;
  quantity?: number | null;
  unit_price?: number | null;
  total_price?: number | null;
  storage_location?: string | null;
  purpose?: string | null;
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

  getProjectsByStaff(staffId: number) {
    return this.http.get<PublicPortalStaffProject[]>(this.baseUrl + `staffs/${staffId}/projects`);
  }

  getStaffSummary(staffId: number) {
    return this.http.get<PublicPortalStaffSummary>(this.baseUrl + `staffs/${staffId}/summary`);
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

  getStaffProcurements(staffId: number) {
    return this.http.get<PublicPortalProcurementSummary[]>(
      this.baseUrl + `staffs/${staffId}/procurements`,
    );
  }

  getStaffAssets(staffId: number) {
    return this.http.get<PublicPortalStaffAssetHolding[]>(this.baseUrl + `staffs/${staffId}/assets`);
  }

  getProcurementDetail(staffId: number, procurementId: number) {
    return this.http.get<PublicPortalProcurementDetail>(
      this.baseUrl + `staffs/${staffId}/procurements/${procurementId}`,
    );
  }
}
