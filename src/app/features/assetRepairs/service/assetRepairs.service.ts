import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { assetRepairsTypes } from '../interface/assetRepairsTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetRepairsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetRepairs(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetRepairsTypes>>(this.baseUrl + 'AssetRepair', {
      params,
    });
  }
  getAssetRepairsby(paramsData: Params, assetId: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<assetRepairsTypes>>(
      this.baseUrl + 'AssetRepair/by-asset/' + assetId,
      { params },
    );
  }

  getAssetRepair(id: number) {
    return this.http.get<assetRepairsTypes>(this.baseUrl + 'AssetRepair/' + id);
  }

  createAssetRepairs(payload: Partial<assetRepairsTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetRepair', payload);
  }

  updateAssetRepairs(id: number, payload: Partial<assetRepairsTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetRepair/' + id, payload);
  }

  deleteAssetRepairs(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetRepair/' + id);
  }
}
