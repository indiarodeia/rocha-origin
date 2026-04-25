import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Product, SaveProductRequest, SearchProductsRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService extends BaseApiService {
  private readonly productsPath = 'Products';

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.buildUrl(this.productsPath));
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(this.buildUrl(`${this.productsPath}/${id}`));
  }

  create(payload: SaveProductRequest): Observable<Product> {
    return this.http.post<Product>(this.buildUrl(this.productsPath), payload);
  }

  update(id: string, payload: SaveProductRequest): Observable<Product> {
    return this.http.put<Product>(this.buildUrl(`${this.productsPath}/${id}`), payload);
  }

  searchAndFilter(payload: SearchProductsRequest): Observable<Product[]> {
    return this.http.post<Product[]>(
      this.buildUrl(`${this.productsPath}/search-and-filter`),
      payload,
    );
  }

  countSearchAndFilter(payload: SearchProductsRequest): Observable<number> {
    return this.http.post<number>(
      this.buildUrl(`${this.productsPath}/search-and-filter/count`),
      payload,
    );
  }

  setAsInactive(id: string): Observable<Product> {
    return this.http.patch<Product>(
      this.buildUrl(`${this.productsPath}/${id}/set-as-inactive`),
      {},
    );
  }
}
