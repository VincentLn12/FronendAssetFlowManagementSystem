import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { DepartmentType } from '../interface/departmentType';
import { Params } from '../../../shared/models/allType';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getDepartments(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<DepartmentType>>(this.baseUrl + 'Departments', {
      params,
    });
  }

  getDepartment(id: number) {
    return this.http.get<DepartmentType>(this.baseUrl + 'Departments/' + id);
  }

  createDepartment(payload: Partial<DepartmentType>) {
    return this.http.post<void>(this.baseUrl + 'Departments', payload);
  }

  updateDepartment(id: number, payload: Partial<DepartmentType>) {
    return this.http.put<void>(this.baseUrl + 'Departments/' + id, payload);
  }

  deleteDepartment(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Departments/' + id);
  }
}
