import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PublicPortalProject {
  project_id: number;
  project_code: string;
  project_name: string;
  project_budget_amount: number;
  fiscal_year_id: number;
  staff_id?: number | null;
  staff_name?: string | null;
  procurement_count: number;
}

export interface PublicPortalProcurement {
  procurement_record_id: number;
  document_no: string;
  document_date?: string | null;
  total_amount: number;
  status: string;
  reference_no?: string | null;
  remark?: string | null;
  project_id: number;
  project_name?: string | null;
  staff_id?: number | null;
  staff_name?: string | null;
  department_id: number;
  department_name?: string | null;
  fiscal_year_id: number;
}

export interface PublicPortalStaff {
  staff_id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department_id: number;
  department_name?: string | null;
  position_name?: string | null;
}

export interface PublicPortalMaterialHistory {
  issue_detail_id: number;
  material_item_id: number;
  material_name: string;
  issue_date?: string | null;
  quantity: number;
  unit_price: number;
  total_amount?: number | null;
  procurement_record_id?: number | null;
  document_no?: string | null;
}

export interface PublicPortalAssetHistory {
  procurement_withdrawal_id: number;
  procurement_record_id: number;
  withdrawal_document_no: string;
  withdrawal_date: string;
  asset_name: string;
  sub_item_name: string;
  quantity: number;
  document_no?: string | null;
}

export interface PublicPortalStaffOverview {
  staff: PublicPortalStaff;
  procurements: PublicPortalProcurement[];
  material_histories: PublicPortalMaterialHistory[];
  asset_histories: PublicPortalAssetHistory[];
}

@Injectable({ providedIn: 'root' })
export class PublicPortalService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + 'PublicPortal/';

  getProjects(search?: string, staffName?: string) {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (staffName?.trim()) params = params.set('staff_name', staffName.trim());
    return this.http.get<PublicPortalProject[]>(this.baseUrl + 'projects', { params });
  }

  getProjectProcurements(projectId: number, staffName?: string) {
    let params = new HttpParams();
    if (staffName?.trim()) params = params.set('staff_name', staffName.trim());
    return this.http.get<PublicPortalProcurement[]>(
      this.baseUrl + `projects/${projectId}/procurements`,
      { params },
    );
  }

  searchStaffs(name?: string) {
    let params = new HttpParams();
    if (name?.trim()) params = params.set('name', name.trim());
    return this.http.get<PublicPortalStaff[]>(this.baseUrl + 'staffs/search', { params });
  }

  getStaffOverview(staffId: number) {
    return this.http.get<PublicPortalStaffOverview>(this.baseUrl + `staffs/${staffId}/overview`);
  }
}
