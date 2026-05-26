import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { Params } from '../../../shared/models/allType';
import { positionsType } from '../interface/positionsType';

@Injectable({
  providedIn: 'root',
})
export class PositionsService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getPositions(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<positionsType>>(this.baseUrl + 'Positions', {
      params,
    });
  }

  getPosition(id: number) {
    return this.http.get<positionsType>(this.baseUrl + 'Positions/' + id);
  }

  createPositions(payload: Partial<positionsType>) {
    return this.http.post<void>(this.baseUrl + 'Positions', payload);
  }

  updatePositions(id: number, payload: Partial<positionsType>) {
    return this.http.put<void>(this.baseUrl + 'Positions/' + id, payload);
  }

  deletePositions(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Positions/' + id);
  }
}
