import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { expenseTypes } from '../interface/expenseTypes';

@Injectable({
  providedIn: 'root',
})
export class ExpensetypesService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getExpenseTypes(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<expenseTypes>>(this.baseUrl + 'Expense_types', {
      params,
    });
  }

  getExpenseType(id: number) {
    return this.http.get<expenseTypes>(this.baseUrl + 'Expense_types/' + id);
  }

  createExpenseTypes(payload: Partial<expenseTypes>) {
    return this.http.post<void>(this.baseUrl + 'Expense_types', payload);
  }

  updateExpenseTypes(id: number, payload: Partial<expenseTypes>) {
    return this.http.put<void>(this.baseUrl + 'Expense_types/' + id, payload);
  }

  deleteExpenseTypes(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Expense_types/' + id);
  }
}
