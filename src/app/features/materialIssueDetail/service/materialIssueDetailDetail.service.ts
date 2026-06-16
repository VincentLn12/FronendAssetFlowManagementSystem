import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { MaterialIssueDetailTypes } from '../interface/materialIssueDetailTypes';

@Injectable({
  providedIn: 'root',
})
export class MaterialIssueDetailService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialIssueDetails(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<MaterialIssueDetailTypes>>(
      this.baseUrl + 'MaterialIssueDetail',
      {
        params,
      },
    );
  }

  getMaterialIssueDetailByProcurements(paramsData: Params, procurement_record_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<MaterialIssueDetailTypes>>(
      this.baseUrl + 'MaterialIssueDetail/by-procurement/' + procurement_record_id,
      {
        params,
      },
    );
  }

  createManyMaterialIssueDetails(payload: { items: Partial<MaterialIssueDetailTypes>[] }) {
    return this.http.post<void>(this.baseUrl + 'MaterialIssueDetail/create-many', payload);
  }

  getMaterialIssueDetail(id: number) {
    return this.http.get<MaterialIssueDetailTypes>(this.baseUrl + 'MaterialIssueDetail/' + id);
  }

  createMaterialIssueDetail(payload: Partial<MaterialIssueDetailTypes>) {
    return this.http.post<void>(this.baseUrl + 'MaterialIssueDetail', payload);
  }

  updateMaterialIssueDetail(id: number, payload: Partial<MaterialIssueDetailTypes>) {
    return this.http.put<void>(this.baseUrl + 'MaterialIssueDetail/' + id, payload);
  }

  deleteMaterialIssueDetail(id: number) {
    return this.http.delete<void>(this.baseUrl + 'MaterialIssueDetail/' + id);
  }
}
