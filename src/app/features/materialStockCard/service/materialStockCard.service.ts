import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MaterialStockCardTypes } from '../interface/materialStockCardTypes';

@Injectable({
  providedIn: 'root',
})
export class MaterialStockCardService {
  private baseUrl = environment.baseUrl;
  private http = inject(HttpClient);

  getStockCard(id: number, fiscalYearId?: number | null) {
    let params = new HttpParams();

    if (fiscalYearId !== null && fiscalYearId !== undefined) {
      params = params.append('fiscal_year_id', fiscalYearId.toString());
    }

    return this.http.get<MaterialStockCardTypes[]>(this.baseUrl + 'MaterialStockCard/' + id, {
      params,
    });
  }
}
