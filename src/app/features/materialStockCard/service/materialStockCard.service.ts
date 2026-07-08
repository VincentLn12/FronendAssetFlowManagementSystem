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

  getStockCard(materialItemId: number, fiscalYearId?: number | null, departmentId?: number | null) {
    let params = new HttpParams();

    if (fiscalYearId) {
      params = params.set('fiscal_year_id', fiscalYearId);
    }

    if (departmentId) {
      params = params.set('department_id', departmentId);
    }

    return this.http.get<MaterialStockCardTypes[]>(
      this.baseUrl + 'MaterialStockCard/' + materialItemId,
      { params },
    );
  }
}
