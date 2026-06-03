import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import {
  assetWithdrawalCreateTypes,
  assetWithdrawalTypes,
} from '../interface/assetWithdrawalTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetWithdrawalService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetWithdrawal(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetWithdrawalTypes>>(this.baseUrl + 'AssetWithdrawal', {
      params,
    });
  }

  getAssetWithdrawalbyProcuremens(paramsData: Params, procurement_record_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetWithdrawalTypes>>(
      this.baseUrl + 'AssetWithdrawal/by-procurement/' + procurement_record_id,
      { params },
    );
  }

  getAssetWithdrawalbyProcuremen(id: number) {
    return this.http.get<assetWithdrawalTypes>(this.baseUrl + 'AssetWithdrawal/' + id);
  }

  createAssetWithdrawal(payload: Partial<assetWithdrawalCreateTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetWithdrawal', payload);
  }

  updateAssetWithdrawal(id: number, payload: Partial<assetWithdrawalCreateTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetWithdrawal/' + id, payload);
  }

  deleteAssetWithdrawal(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetWithdrawal/' + id);
  }
}
