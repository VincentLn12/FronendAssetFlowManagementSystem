import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import {
  MaterialWithdrawalCreateTypes,
  MaterialWithdrawalTypes,
} from '../interface/materialWithdrawalTypes';
@Injectable({
  providedIn: 'root',
})
export class MaterialWithdrawalService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialWithdrawals(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<MaterialWithdrawalTypes>>(this.baseUrl + 'MaterialWithdrawal', {
      params,
    });
  }

  getMaterialWithdrawalbyProcuremens(paramsData: Params, procurement_record_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<MaterialWithdrawalTypes>>(
      this.baseUrl + 'MaterialWithdrawal/by-procurement/' + procurement_record_id,
      { params },
    );
  }

  getMaterialWithdrawal(id: number) {
    return this.http.get<MaterialWithdrawalTypes>(this.baseUrl + 'MaterialWithdrawal/' + id);
  }

  createMaterialWithdrawal(payload: Partial<MaterialWithdrawalCreateTypes>) {
    return this.http.post<void>(this.baseUrl + 'MaterialWithdrawal', payload);
  }

  updateMaterialWithdrawal(id: number, payload: Partial<MaterialWithdrawalCreateTypes>) {
    return this.http.put<void>(this.baseUrl + 'MaterialWithdrawal/' + id, payload);
  }

  deleteMaterialWithdrawal(id: number) {
    return this.http.delete<void>(this.baseUrl + 'MaterialWithdrawal/' + id);
  }
}
