import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import {
  procurementrecordTypes,
  procurementrecordCreateTypes,
} from '../interface/procurementrecordTypes';

@Injectable({
  providedIn: 'root',
})
export class ProcurementrecordService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getProcurementrecords(
    paramsData: Params,
    project_id?: number | null,
    expense_type_id?: number | null,
    fiscal_year_id?: number | null,
  ) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    if (project_id) {
      params = params.append('projectId', project_id);
    }

    if (expense_type_id) {
      params = params.append('expenseTypeId', expense_type_id);
    }

    if (fiscal_year_id) {
      params = params.append('fiscalYearId', fiscal_year_id);
    }

    return this.http.get<Pagination<procurementrecordTypes>>(this.baseUrl + 'Procurement_records', {
      params,
    });
  }

  getProcurementrecord(id: number) {
    return this.http.get<procurementrecordTypes>(this.baseUrl + 'Procurement_records/' + id);
  }

  createProcurementrecord(payload: Partial<procurementrecordCreateTypes>) {
    return this.http.post<void>(this.baseUrl + 'Procurement_records', payload);
  }

  updateProcurementrecord(id: number, payload: Partial<procurementrecordCreateTypes>) {
    return this.http.put<void>(this.baseUrl + 'Procurement_records/' + id, payload);
  }

  deleteProcurementrecord(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Procurement_records/' + id);
  }
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ fileName: string; filePath: string }>(
      this.baseUrl + 'Procurement_records/upload',
      formData,
    );
  }
}
