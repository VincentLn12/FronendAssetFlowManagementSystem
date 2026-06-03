import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { assetUsageType } from '../interface/assetUsageType';

@Injectable({
  providedIn: 'root',
})
export class AssetUsageTypeService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetUsageTypes(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetUsageType>>(this.baseUrl + 'AssetUsageType', {
      params,
    });
  }

  getAssetUsageType(id: number) {
    return this.http.get<assetUsageType>(this.baseUrl + 'AssetUsageType/' + id);
  }

  createAssetUsageTypes(payload: Partial<assetUsageType>) {
    return this.http.post<void>(this.baseUrl + 'AssetUsageType', payload);
  }

  updateAssetUsageTypes(id: number, payload: Partial<assetUsageType>) {
    return this.http.put<void>(this.baseUrl + 'AssetUsageType/' + id, payload);
  }

  deleteAssetUsageTypes(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetUsageType/' + id);
  }
}
