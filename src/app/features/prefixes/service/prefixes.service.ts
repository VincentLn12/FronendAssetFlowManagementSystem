import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Pagination } from '../../../shared/models/pagination';
import { prefixesType } from '../interface/prefixesType';
import { Params } from '../../../shared/models/allType';

@Injectable({
  providedIn: 'root',
})
export class PrefixesService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getPrefixes(paramsData: Params) {
    let params = new HttpParams();

    if (paramsData.sort) {
      params = params.append('sort', paramsData.sort);
    }

    if (paramsData.search) {
      params = params.append('search', paramsData.search);
    }

    params = params.append('pageSize', paramsData.pageSize);
    params = params.append('pageIndex', paramsData.pageNumber);

    return this.http.get<Pagination<prefixesType>>(this.baseUrl + 'Prefixes', {
      params,
    });
  }

  getPrefix(id: number) {
    return this.http.get<prefixesType>(this.baseUrl + 'Prefixes/' + id);
  }

  createPrefixes(payload: Partial<prefixesType>) {
    return this.http.post<void>(this.baseUrl + 'Prefixes', payload);
  }

  updatePrefixes(id: number, payload: Partial<prefixesType>) {
    return this.http.put<void>(this.baseUrl + 'Prefixes/' + id, payload);
  }

  deletePrefixes(id: number) {
    return this.http.delete<void>(this.baseUrl + 'Prefixes/' + id);
  }
}
