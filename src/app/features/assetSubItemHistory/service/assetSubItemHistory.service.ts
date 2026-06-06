import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { assetSubItemHistoryTypes } from '../interface/assetSubItemHistoryTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetSubItemHistoryService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getassetSubItemHistorys(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetSubItemHistoryTypes>>(
      this.baseUrl + 'AssetSubItemHistory',
      {
        params,
      },
    );
  }

  getassetSubItemHistoryby(paramsData: Params, procurement_withdrawal_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetSubItemHistoryTypes>>(
      this.baseUrl + 'AssetSubItemHistory/by-withdrawal/' + procurement_withdrawal_id,
      { params },
    );
  }

  getassetSubItemHistory(id: number) {
    return this.http.get<assetSubItemHistoryTypes>(this.baseUrl + 'AssetSubItemHistory/' + id);
  }

  createassetSubItemHistory(payload: Partial<assetSubItemHistoryTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetSubItemHistory', payload);
  }

  updateassetSubItemHistory(id: number, payload: Partial<assetSubItemHistoryTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetSubItemHistory/' + id, payload);
  }

  deleteassetSubItemHistory(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetSubItemHistory/' + id);
  }
}
