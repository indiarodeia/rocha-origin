import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { ClientUpsertInput, mapApiClientToUiClient, mapClientToSaveClientRequest } from '../api/mappers/client.mapper';
import { PaymentType } from '../api/models';
import { ClientApiService } from '../api/services/client-api.service';
import { ReferenceDataApiService } from '../api/services/reference-data-api.service';
import { Client } from '../models/client.model';

export interface ClientsQuery {
  searchText: string;
  city: string;
  paymentTypeId?: number;
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC';
  pageIndex: number;
  pageSize: number;
}

export interface ClientsSearchResult {
  items: Client[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  constructor(
    private readonly clientApiService: ClientApiService,
    private readonly referenceDataApiService: ReferenceDataApiService,
  ) {}

  getPaymentTypes(): Observable<PaymentType[]> {
    return this.referenceDataApiService.getPaymentTypes().pipe(
      map((types) => [...types].filter((type) => type.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  search(query: ClientsQuery): Observable<ClientsSearchResult> {
    const payload = this.toSearchPayload(query);

    return forkJoin({
      items: this.clientApiService.searchAndFilter(payload),
      totalCount: this.clientApiService.countSearchAndFilter(payload),
    }).pipe(
      map(({ items, totalCount }) => ({
        items: items.map(mapApiClientToUiClient),
        totalCount,
      })),
    );
  }

  getById(id: string): Observable<Client> {
    return this.clientApiService.getById(id).pipe(map(mapApiClientToUiClient));
  }

  create(payload: ClientUpsertInput): Observable<Client> {
    return this.clientApiService.create(mapClientToSaveClientRequest(payload)).pipe(map(mapApiClientToUiClient));
  }

  update(id: string, payload: ClientUpsertInput): Observable<Client> {
    return this.clientApiService.update(id, mapClientToSaveClientRequest(payload)).pipe(map(mapApiClientToUiClient));
  }

  setAsInactive(id: string): Observable<Client> {
    return this.clientApiService.setAsInactive(id).pipe(map(mapApiClientToUiClient));
  }

  private toSearchPayload(query: ClientsQuery) {
    const sortMap = {
      NAME_ASC: { sortBy: 'companyName', isSortAscending: true },
      NAME_DESC: { sortBy: 'companyName', isSortAscending: false },
      CREATED_DESC: { sortBy: 'createdAt', isSortAscending: false },
      CREATED_ASC: { sortBy: 'createdAt', isSortAscending: true },
    } as const;

    const sort = sortMap[query.sortBy];

    return {
      search: query.searchText.trim() || null,
      city: query.city === 'ALL' ? null : query.city,
      paymentTypeId: query.paymentTypeId ?? null,
      sortBy: sort.sortBy,
      isSortAscending: sort.isSortAscending,
      pageNumber: query.pageIndex + 1,
      pageSize: query.pageSize,
    };
  }
}
