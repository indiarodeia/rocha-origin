import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import {
  mapApiProductToUiProduct,
  mapProductToSaveRequest,
  ProductUpsertInput,
} from '../../../core/api/mappers/product.mapper';
import { ProductCategory, ProductUnit } from '../../../core/api/models';
import { ProductApiService } from '../../../core/api/services/product-api.service';
import { ReferenceDataApiService } from '../../../core/api/services/reference-data-api.service';
import { Product } from '../../../core/models/product.model';

export interface ProductsQuery {
  searchText: string;
  categoryId: number | null;
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC';
  pageIndex: number;
  pageSize: number;
}

export interface ProductsSearchResult {
  items: Product[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(
    private readonly productApiService: ProductApiService,
    private readonly referenceDataApiService: ReferenceDataApiService,
  ) {}

  getProductCategories(): Observable<ProductCategory[]> {
    return this.referenceDataApiService.getProductCategories().pipe(
      map((cats) => [...cats].filter((c) => c.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  getProductUnits(): Observable<ProductUnit[]> {
    return this.referenceDataApiService.getProductUnits().pipe(
      map((units) => [...units].filter((u) => u.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  search(query: ProductsQuery): Observable<ProductsSearchResult> {
    const payload = this.toSearchPayload(query);

    return forkJoin({
      items: this.productApiService.searchAndFilter(payload),
      totalCount: this.productApiService.countSearchAndFilter(payload).pipe(catchError(() => of(0))),
    }).pipe(
      map(({ items, totalCount }) => ({
        items: items.map(mapApiProductToUiProduct),
        totalCount,
      })),
    );
  }

  getById(id: string): Observable<Product> {
    return this.productApiService.getById(id).pipe(map(mapApiProductToUiProduct));
  }

  create(input: ProductUpsertInput): Observable<Product> {
    return this.productApiService
      .create(mapProductToSaveRequest(input))
      .pipe(map(mapApiProductToUiProduct));
  }

  update(id: string, input: ProductUpsertInput): Observable<Product> {
    return this.productApiService
      .update(id, mapProductToSaveRequest(input))
      .pipe(map(mapApiProductToUiProduct));
  }

  setAsInactive(id: string): Observable<Product> {
    return this.productApiService.setAsInactive(id).pipe(map(mapApiProductToUiProduct));
  }

  private toSearchPayload(query: ProductsQuery) {
    const sortMap = {
      NAME_ASC: { sortBy: 'name', isSortAscending: true },
      NAME_DESC: { sortBy: 'name', isSortAscending: false },
      CREATED_DESC: { sortBy: 'createdAt', isSortAscending: false },
      CREATED_ASC: { sortBy: 'createdAt', isSortAscending: true },
    } as const;

    const sort = sortMap[query.sortBy];

    return {
      search: query.searchText.trim() || null,
      categoryId: query.categoryId,
      sortBy: sort.sortBy,
      isSortAscending: sort.isSortAscending,
      pageNumber: query.pageIndex + 1,
      pageSize: query.pageSize,
    };
  }
}
