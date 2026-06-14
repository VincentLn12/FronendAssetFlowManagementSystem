import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import {
  materialReceiveDetailTypes,
  MaterialStockCardTypes,
} from '../interface/materialReceiveDetailTypes';

@Injectable({
  providedIn: 'root',
})
export class MaterialReceiveDetailService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getMaterialReceiveDetails(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<materialReceiveDetailTypes>>(
      this.baseUrl + 'MaterialReceiveDetail',
      {
        params,
      },
    );
  }

  getMaterialReceiveDetailbyProcuremens(paramsData: Params, procurement_record_id: number) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<materialReceiveDetailTypes>>(
      this.baseUrl + 'MaterialReceiveDetail/by-procurement-record/' + procurement_record_id,
      { params },
    );
  }

  getStockCard(material_item_id: number) {
    return this.http.get<MaterialStockCardTypes[]>(
      this.baseUrl + `MaterialReceiveDetail/stock-card/${material_item_id}`,
    );
  }

  getMaterialReceiveDetail(id: number) {
    return this.http.get<materialReceiveDetailTypes>(this.baseUrl + 'MaterialReceiveDetail/' + id);
  }

  createMaterialReceiveDetail(payload: Partial<materialReceiveDetailTypes>) {
    return this.http.post<void>(this.baseUrl + 'MaterialReceiveDetail', payload);
  }

  updateMaterialReceiveDetail(id: number, payload: Partial<materialReceiveDetailTypes>) {
    return this.http.put<void>(this.baseUrl + 'MaterialReceiveDetail/' + id, payload);
  }

  deleteMaterialReceiveDetail(id: number) {
    return this.http.delete<void>(this.baseUrl + 'MaterialReceiveDetail/' + id);
  }
}
