import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { fiscalyearsType } from '../interface/fiscalyearsType';

@Injectable({
  providedIn: 'root',
})
export class FiscalyearsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getFiscalyears(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<fiscalyearsType>>(this.baseUrl + 'Fiscal_years', {
      params,
    });
  }

  getFiscalyear(id: number) {
    return this.http.get<fiscalyearsType>(this.baseUrl + 'Fiscal_years/' + id);
  }

  createFiscalyears(payload: Partial<fiscalyearsType>) {
    return this.http.post<void>(this.baseUrl + 'Fiscal_years', payload);
  }

  updateFiscalyears(id: number, payload: Partial<fiscalyearsType>) {
    return this.http.put<void>(this.baseUrl + 'Fiscal_years/' + id, payload);
  }

  deleteFiscalyears(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Fiscal_years/' + id);
  }
}
