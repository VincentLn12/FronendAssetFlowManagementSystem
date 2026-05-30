import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { hireDetailCreateType, hireDetailType } from '../interface/hireDetailType';

@Injectable({
  providedIn: 'root',
})
export class HireDetailsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getHireDetails(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<hireDetailType>>(this.baseUrl + 'Hiredetails', {
      params,
    });
  }
  getHireDetail(id: number) {
    return this.http.get<hireDetailType>(this.baseUrl + 'Hiredetails/' + id);
  }

  createHireDetails(payload: Partial<hireDetailCreateType>) {
    return this.http.post<void>(this.baseUrl + 'Hiredetails', payload);
  }

  updateHireDetails(id: number, payload: Partial<hireDetailCreateType>) {
    return this.http.put<void>(this.baseUrl + 'Hiredetails/' + id, payload);
  }

  deleteHireDetails(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Hiredetails/' + id);
  }
  getHireDetailsbyProcuremen(procurement_record_id: number) {
    return this.http.get<hireDetailType[]>(
      this.baseUrl + 'Hiredetails/by-procurement/' + procurement_record_id,
    );
  }
}
