import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { staffsType, staffsTypeCreate } from '../interface/staffsType';

@Injectable({
  providedIn: 'root',
})
export class StaffsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getStaffs(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<staffsType>>(this.baseUrl + 'Staff', {
      params,
    });
  }

  getStaff(id: number) {
    return this.http.get<staffsTypeCreate>(this.baseUrl + 'Staff/' + id);
  }

  createStaff(payload: Partial<staffsTypeCreate>) {
    return this.http.post<void>(this.baseUrl + 'Staff', payload);
  }

  updateStaff(id: number, payload: Partial<staffsTypeCreate>) {
    return this.http.put<void>(this.baseUrl + 'Staff/' + id, payload);
  }

  deleteStaff(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Staff/' + id);
  }
}
