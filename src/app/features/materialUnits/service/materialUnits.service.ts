import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { materialUnitsTypes } from '../interface/materialUnitsTypes';

@Injectable({
  providedIn: 'root',
})
export class MaterialUnitsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialUnits(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<materialUnitsTypes>>(this.baseUrl + 'MaterialUnit', {
      params,
    });
  }

  getMaterialUnit(id: number) {
    return this.http.get<materialUnitsTypes>(this.baseUrl + 'MaterialUnit/' + id);
  }

  createMaterialUnits(payload: Partial<materialUnitsTypes>) {
    return this.http.post<void>(this.baseUrl + 'MaterialUnit', payload);
  }

  updateMaterialUnits(id: number, payload: Partial<materialUnitsTypes>) {
    return this.http.put<void>(this.baseUrl + 'MaterialUnit/' + id, payload);
  }

  deleteMaterialUnits(id: number) {
    return this.http.delete<void>(this.baseUrl + 'MaterialUnit/' + id);
  }
}
