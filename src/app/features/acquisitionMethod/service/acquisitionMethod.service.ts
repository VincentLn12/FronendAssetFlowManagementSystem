import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { acquisitionMethodTypes } from '../interface/acquisitionMethodTypes';

@Injectable({
  providedIn: 'root',
})
export class AcquisitionMethodService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getAcquisitionMethods(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<acquisitionMethodTypes>>(this.baseUrl + 'AcquisitionMethod', {
      params,
    });
  }

  getAcquisitionMethod(id: number) {
    return this.http.get<acquisitionMethodTypes>(this.baseUrl + 'AcquisitionMethod/' + id);
  }

  createAcquisitionMethod(payload: Partial<acquisitionMethodTypes>) {
    return this.http.post<void>(this.baseUrl + 'AcquisitionMethod', payload);
  }

  updateAcquisitionMethod(id: number, payload: Partial<acquisitionMethodTypes>) {
    return this.http.put<void>(this.baseUrl + 'AcquisitionMethod/' + id, payload);
  }

  deleteAcquisitionMethod(id: number) {
    return this.http.delete<void>(this.baseUrl + 'AcquisitionMethod/' + id);
  }
}
