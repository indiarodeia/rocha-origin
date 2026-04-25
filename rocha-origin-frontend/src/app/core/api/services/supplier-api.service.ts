import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { SaveSupplierRequest, SearchSuppliersRequest, Supplier } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SupplierApiService extends BaseApiService {
  private readonly suppliersPath = 'Suppliers';

  getById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(this.buildUrl(`${this.suppliersPath}/${id}`));
  }

  create(payload: SaveSupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.buildUrl(this.suppliersPath), payload);
  }

  update(id: string, payload: SaveSupplierRequest): Observable<Supplier> {
    return this.http.put<Supplier>(this.buildUrl(`${this.suppliersPath}/${id}`), payload);
  }

  searchAndFilter(payload: SearchSuppliersRequest): Observable<Supplier[]> {
    return this.http.post<Supplier[]>(
      this.buildUrl(`${this.suppliersPath}/search-and-filter`),
      payload,
    );
  }

  countSearchAndFilter(payload: SearchSuppliersRequest): Observable<number> {
    return this.http.post<number>(
      this.buildUrl(`${this.suppliersPath}/search-and-filter/count`),
      payload,
    );
  }

  setAsInactive(id: string): Observable<Supplier> {
    return this.http.patch<Supplier>(
      this.buildUrl(`${this.suppliersPath}/${id}/set-as-inactive`),
      {},
    );
  }
}
