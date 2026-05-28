import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { fundcategorysTypes } from '../interface/fundcategorysTypes';

@Injectable({
  providedIn: 'root',
})
export class FundcategorysService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getFundcategorys(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<fundcategorysTypes>>(this.baseUrl + 'Fund_categories', {
      params,
    });
  }

  getFundcategory(id: number) {
    return this.http.get<fundcategorysTypes>(this.baseUrl + 'Fund_categories/' + id);
  }

  createFundcategorys(payload: Partial<fundcategorysTypes>) {
    return this.http.post<void>(this.baseUrl + 'Fund_categories', payload);
  }

  updateFundcategorys(id: number, payload: Partial<fundcategorysTypes>) {
    return this.http.put<void>(this.baseUrl + 'Fund_categories/' + id, payload);
  }

  deleteFundcategorys(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Fund_categories/' + id);
  }
}
