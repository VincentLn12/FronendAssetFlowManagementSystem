import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { assetSubItemTypes, assetSubItemCreateTypes } from '../interface/assetsubItemsTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetSubItemsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetSubItems(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetSubItemTypes>>(this.baseUrl + 'AssetsubItem', {
      params,
    });
  }

  getAssetSubItemsbyProcuremen(paramsData: Params, asset_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetSubItemTypes>>(
      this.baseUrl + 'AssetsubItem/by-assetitem/' + asset_id,
      { params },
    );
  }

  getAssetSubItem(id: number) {
    return this.http.get<assetSubItemCreateTypes>(this.baseUrl + 'AssetsubItem/' + id);
  }

  createAssetSubItems(payload: Partial<assetSubItemCreateTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetsubItem', payload);
  }

  updateAssetSubItems(id: number, payload: Partial<assetSubItemCreateTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetsubItem/' + id, payload);
  }

  deleteAssetSubItems(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetsubItem/' + id);
  }
}
