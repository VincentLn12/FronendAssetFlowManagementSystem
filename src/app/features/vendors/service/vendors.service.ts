import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { vendorsTypes } from '../interface/vendorsTypes';

@Injectable({
  providedIn: 'root',
})
export class VendorsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getVendors(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<vendorsTypes>>(this.baseUrl + 'Vendors', {
      params,
    });
  }

  getVendor(id: number) {
    return this.http.get<vendorsTypes>(this.baseUrl + 'Vendors/' + id);
  }

  createVendors(payload: Partial<vendorsTypes>) {
    return this.http.post<void>(this.baseUrl + 'Vendors', payload);
  }

  updateVendors(id: number, payload: Partial<vendorsTypes>) {
    return this.http.put<void>(this.baseUrl + 'Vendors/' + id, payload);
  }

  deleteVendors(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Vendors/' + id);
  }
}
