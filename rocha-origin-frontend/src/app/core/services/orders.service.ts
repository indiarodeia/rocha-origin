import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import {
  mapApiOrderToUiOrder,
  mapOrderCreateInputToSaveOrderRequest,
  OrderCreateInput,
} from '../api/mappers/order.mapper';
import {
  DeliveryType,
  OrderStatus as ApiOrderStatus,
  UpdateOrderStatusRequestDto,
} from '../api/models';
import { OrderApiService } from '../api/services/order-api.service';
import { ReferenceDataApiService } from '../api/services/reference-data-api.service';
import { Order } from '../models/order.model';

export interface OrdersQuery {
  searchText: string;
  statusIds: number[];
  routeIds: string[];
  deliveryTypeId?: number;
  hideDelivered: boolean;
  sortDirection: 'asc' | 'desc';
  pageIndex: number;
  pageSize: number;
}

export interface OrdersSearchResult {
  items: Order[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(
    private readonly orderApiService: OrderApiService,
    private readonly referenceDataApiService: ReferenceDataApiService,
  ) {}

  getOrderStatuses(): Observable<ApiOrderStatus[]> {
    return this.referenceDataApiService.getOrderStatuses().pipe(
      map((statuses) => [...statuses].filter((status) => status.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  getDeliveryTypes(): Observable<DeliveryType[]> {
    return this.referenceDataApiService.getDeliveryTypes().pipe(
      map((types) => [...types].filter((type) => type.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  search(query: OrdersQuery): Observable<OrdersSearchResult> {
    const payload = {
      search: query.searchText.trim() || null,
      statusIds: query.statusIds.length > 0 ? query.statusIds : null,
      routeIds: query.routeIds.length > 0 ? query.routeIds : null,
      deliveryTypeId: query.deliveryTypeId ?? null,
      hideDelivered: query.hideDelivered,
      isSortAscending: query.sortDirection === 'asc',
      pageNumber: query.pageIndex + 1,
      pageSize: query.pageSize,
    };

    return forkJoin({
      items: this.orderApiService.searchAndFilter(payload),
      totalCount: this.orderApiService.countSearchAndFilter(payload).pipe(
        map((value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)),
        catchError(() => of(0)),
      ),
    }).pipe(
      map(({ items, totalCount }) => ({
        items: Array.isArray(items) ? items.map(mapApiOrderToUiOrder) : [],
        totalCount: totalCount > 0 ? totalCount : (Array.isArray(items) ? items.length : 0),
      })),
    );
  }

  getById(id: string): Observable<Order> {
    return this.orderApiService.getById(id).pipe(map(mapApiOrderToUiOrder));
  }

  create(payload: OrderCreateInput): Observable<Order> {
    return this.orderApiService
      .create(mapOrderCreateInputToSaveOrderRequest(payload))
      .pipe(map(mapApiOrderToUiOrder));
  }

  updateStatus(id: string, payload: UpdateOrderStatusRequestDto): Observable<Order> {
    return this.orderApiService.updateStatus(id, payload).pipe(map(mapApiOrderToUiOrder));
  }

  setAsInactive(id: string): Observable<Order> {
    return this.orderApiService.setAsInactive(id).pipe(map(mapApiOrderToUiOrder));
  }
}
