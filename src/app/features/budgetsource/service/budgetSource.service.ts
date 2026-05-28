import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { budgetsourceTypes } from '../interface/budgetsourceTypes';

@Injectable({
  providedIn: 'root',
})
export class BudgetsourceService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getBudgetsources(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<budgetsourceTypes>>(this.baseUrl + 'Budget_sources', {
      params,
    });
  }

  getBudgetsource(id: number) {
    return this.http.get<budgetsourceTypes>(this.baseUrl + 'Budget_sources/' + id);
  }

  createBudgetsources(payload: Partial<budgetsourceTypes>) {
    return this.http.post<void>(this.baseUrl + 'Budget_sources', payload);
  }

  updateBudgetsources(id: number, payload: Partial<budgetsourceTypes>) {
    return this.http.put<void>(this.baseUrl + 'Budget_sources/' + id, payload);
  }

  deleteBudgetsources(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Budget_sources/' + id);
  }
}
