import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { materialItemsTypes } from '../interface/materialItemsTypes';

export type MaterialItemQueryParams = Params & {
  fiscalYearId?: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class MaterialItemsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialItems(paramsData: MaterialItemQueryParams) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    if (paramsData.fiscalYearId && paramsData.fiscalYearId > 0) {
      params = params.append('FiscalYearId', paramsData.fiscalYearId.toString());
    }

    params = params.append('pageSize', paramsData.pageSize.toString());
    params = params.append('pageIndex', paramsData.pageNumber.toString());

    return this.http.get<Pagination<materialItemsTypes>>(this.baseUrl + 'MaterialItem', { params });
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
  copyMaterialItems(id: number) {
    return this.http.post<materialItemsTypes>(this.baseUrl + 'MaterialItem/' + id + '/copy', {});
  }
}
