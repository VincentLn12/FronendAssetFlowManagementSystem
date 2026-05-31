import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { assetItemsTypes, assetItemsCreateTypes } from '../interface/assetItemsTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetItemsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetItems(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetItemsTypes>>(this.baseUrl + 'AssetItem', {
      params,
    });
  }

  getAssetItembyProcuremen(paramsData: Params, procurement_record_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetItemsTypes>>(
      this.baseUrl + 'AssetItem/by-procurement/' + procurement_record_id,
      { params },
    );
  }

  getAssetItem(id: number) {
    return this.http.get<assetItemsCreateTypes>(this.baseUrl + 'AssetItem/' + id);
  }

  createAssetItems(payload: Partial<assetItemsCreateTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetItem', payload);
  }

  updateAssetItems(id: number, payload: Partial<assetItemsCreateTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetItem/' + id, payload);
  }

  deleteAssetItems(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetItem/' + id);
  }
}
