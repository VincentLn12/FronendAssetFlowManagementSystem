import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { projectsTypes, ProjectAddUpdateDto } from '../interface/projectsTypes';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getProjects(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<projectsTypes>>(this.baseUrl + 'Projects', {
      params,
    });
  }

  getProject(id: number) {
    return this.http.get<projectsTypes>(this.baseUrl + 'Projects/' + id);
  }

  createProjects(payload: Partial<ProjectAddUpdateDto>) {
    return this.http.post<void>(this.baseUrl + 'Projects', payload);
  }

  updateProjects(id: number, payload: Partial<ProjectAddUpdateDto>) {
    return this.http.put<void>(this.baseUrl + 'Projects/' + id, payload);
  }

  deleteProjects(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Projects/' + id);
  }
}
