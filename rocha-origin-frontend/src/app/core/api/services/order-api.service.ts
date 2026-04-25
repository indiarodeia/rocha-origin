import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import type { SaveOrderRequest } from '../mappers/order.mapper';
import {
  Order,
  SearchAndFilterOrdersRequestDto,
  UpdateOrderStatusRequestDto,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService extends BaseApiService {
  private readonly ordersPath = 'Orders';

  searchAndFilter(payload: SearchAndFilterOrdersRequestDto): Observable<Order[]> {
    return this.http.post<Order[]>(this.buildUrl(`${this.ordersPath}/search-and-filter`), payload);
  }

  countSearchAndFilter(payload: SearchAndFilterOrdersRequestDto): Observable<number> {
    return this.http.post<number>(
      this.buildUrl(`${this.ordersPath}/search-and-filter/count`),
      payload,
    );
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(this.buildUrl(`${this.ordersPath}/${id}`));
  }

  create(payload: SaveOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.buildUrl(this.ordersPath), payload);
  }

  updateStatus(id: string, payload: UpdateOrderStatusRequestDto): Observable<Order> {
    return this.http.patch<Order>(this.buildUrl(`${this.ordersPath}/${id}/status`), payload);
  }

  setAsInactive(id: string): Observable<Order> {
    return this.http.patch<Order>(this.buildUrl(`${this.ordersPath}/${id}/set-as-inactive`), {});
  }
}
