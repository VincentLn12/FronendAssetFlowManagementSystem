import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { AssetCategoriesTypes } from '../interface/AssetCategoriesTypes';

@Injectable({
  providedIn: 'root',
})
export class AssetCategoriesService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAssetCategories(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<AssetCategoriesTypes>>(this.baseUrl + 'AssetCategories', {
      params,
    });
  }

  getAssetCategorie(id: number) {
    return this.http.get<AssetCategoriesTypes>(this.baseUrl + 'AssetCategories/' + id);
  }

  createAssetCategories(payload: Partial<AssetCategoriesTypes>) {
    return this.http.post<void>(this.baseUrl + 'AssetCategories', payload);
  }

  updateAssetCategories(id: number, payload: Partial<AssetCategoriesTypes>) {
    return this.http.put<void>(this.baseUrl + 'AssetCategories/' + id, payload);
  }

  deleteAssetCategories(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AssetCategories/' + id);
  }
}
