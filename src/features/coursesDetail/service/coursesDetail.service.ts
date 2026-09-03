import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pagination } from '../../../app/shared/models/pagination';
import { Params } from '../../../app/shared/models/allType';
import { CoursesDetailType } from '../interface/coursesDetailTypes';

@Injectable({
  providedIn: 'root',
})
export class CoursesDetailService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getCoursesDetails(paramsData: Params, courseId?: number | null) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    if (courseId) {
      params = params.append('courseId', courseId);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<CoursesDetailType>>(this.baseUrl + 'CoursesDetail', {
      params,
    });
  }

  getCoursesDetail(id: number) {
    return this.http.get<CoursesDetailType>(this.baseUrl + 'CoursesDetail/' + id);
  }

  createCoursesDetail(payload: Partial<CoursesDetailType>) {
    return this.http.post<void>(this.baseUrl + 'CoursesDetail', payload);
  }

  updateCoursesDetail(id: number, payload: Partial<CoursesDetailType>) {
    return this.http.put<void>(this.baseUrl + 'CoursesDetail/' + id, payload);
  }

  deleteCoursesDetail(id: number) {
    return this.http.delete<void>(this.baseUrl + 'CoursesDetail/' + id);
  }
}
