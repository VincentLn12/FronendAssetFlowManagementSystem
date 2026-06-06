import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { materialItemsTypes } from '../interface/materialItemsTypes';

@Injectable({
  providedIn: 'root',
})
export class MaterialItemsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialItems(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<materialItemsTypes>>(this.baseUrl + 'MaterialItem', {
      params,
    });
  }

  getMaterialItem(id: number) {
    return this.http.get<materialItemsTypes>(this.baseUrl + 'MaterialItem/' + id);
  }

  createMaterialItems(payload: Partial<materialItemsTypes>) {
    return this.http.post<void>(this.baseUrl + 'MaterialItem', payload);
  }

  updateMaterialItems(id: number, payload: Partial<materialItemsTypes>) {
    return this.http.put<void>(this.baseUrl + 'MaterialItem/' + id, payload);
  }

  deleteMaterialItems(id: number) {
    return this.http.delete<void>(this.baseUrl + 'MaterialItem/' + id);
  }
}
