import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import {
  mapApiSupplierToUiSupplier,
  mapSupplierToSaveRequest,
  SupplierUpsertInput,
} from '../../../core/api/mappers/supplier.mapper';
import { SupplierApiService } from '../../../core/api/services/supplier-api.service';
import { Supplier } from '../../../core/models/supplier.model';

export interface SuppliersQuery {
  searchText: string;
  city: string | null;
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC';
  pageIndex: number;
  pageSize: number;
}

export interface SuppliersSearchResult {
  items: Supplier[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  constructor(private readonly supplierApiService: SupplierApiService) {}

  search(query: SuppliersQuery): Observable<SuppliersSearchResult> {
    const payload = this.toSearchPayload(query);

    return forkJoin({
      items: this.supplierApiService.searchAndFilter(payload),
      totalCount: this.supplierApiService.countSearchAndFilter(payload).pipe(catchError(() => of(0))),
    }).pipe(
      map(({ items, totalCount }) => ({
        items: items.map(mapApiSupplierToUiSupplier),
        totalCount,
      })),
    );
  }

  getById(id: string): Observable<Supplier> {
    return this.supplierApiService.getById(id).pipe(map(mapApiSupplierToUiSupplier));
  }

  create(input: SupplierUpsertInput): Observable<Supplier> {
    return this.supplierApiService
      .create(mapSupplierToSaveRequest(input))
      .pipe(map(mapApiSupplierToUiSupplier));
  }

  update(id: string, input: SupplierUpsertInput): Observable<Supplier> {
    return this.supplierApiService
      .update(id, mapSupplierToSaveRequest(input))
      .pipe(map(mapApiSupplierToUiSupplier));
  }

  setAsInactive(id: string): Observable<Supplier> {
    return this.supplierApiService.setAsInactive(id).pipe(map(mapApiSupplierToUiSupplier));
  }

  private toSearchPayload(query: SuppliersQuery) {
    const sortMap = {
      NAME_ASC: { sortBy: 'name', isSortAscending: true },
      NAME_DESC: { sortBy: 'name', isSortAscending: false },
      CREATED_DESC: { sortBy: 'createdAt', isSortAscending: false },
      CREATED_ASC: { sortBy: 'createdAt', isSortAscending: true },
    } as const;

    const sort = sortMap[query.sortBy];

    return {
      search: query.searchText.trim() || null,
      city: query.city || null,
      sortBy: sort.sortBy,
      isSortAscending: sort.isSortAscending,
      pageNumber: query.pageIndex + 1,
      pageSize: query.pageSize,
    };
  }
}
