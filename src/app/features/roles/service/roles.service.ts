import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { roleType } from '../interface/roleType';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getRoles(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<roleType>>(this.baseUrl + 'Roles', {
      params,
    });
  }

  getRole(id: string) {
    return this.http.get<roleType>(this.baseUrl + 'Roles/' + id);
  }

  createRoles(payload: Partial<roleType>) {
    return this.http.post<void>(this.baseUrl + 'Roles', payload);
  }

  updateRoles(id: string, payload: Partial<roleType>) {
    return this.http.put<void>(this.baseUrl + 'Roles/' + id, payload);
  }

  deleteRoles(id: string) {
    return this.http.delete<void>(this.baseUrl + 'Roles/' + id);
  }
}
