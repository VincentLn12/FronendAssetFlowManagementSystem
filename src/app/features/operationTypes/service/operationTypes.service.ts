import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { OperationTypes } from '../interface/operationTypes';

@Injectable({
  providedIn: 'root',
})
export class OperationsTypeService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getOperationtypes(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<OperationTypes>>(this.baseUrl + 'Operation_types', {
      params,
    });
  }

  getOperationtype(id: number) {
    return this.http.get<OperationTypes>(this.baseUrl + 'Operation_types/' + id);
  }

  createOperationtypes(payload: Partial<OperationTypes>) {
    return this.http.post<void>(this.baseUrl + 'Operation_types', payload);
  }

  updateOperationtypes(id: number, payload: Partial<OperationTypes>) {
    return this.http.put<void>(this.baseUrl + 'Operation_types/' + id, payload);
  }

  deleteOperationtypes(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Operation_types/' + id);
  }
}
