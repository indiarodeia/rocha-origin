import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { OrderItem } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderItemApiService extends BaseApiService {
  private readonly orderItemsPath = 'OrderItems';

  getByOrderId(orderId: string): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(this.buildUrl(`${this.orderItemsPath}/by-order/${orderId}`));
  }

  getById(id: string): Observable<OrderItem> {
    return this.http.get<OrderItem>(this.buildUrl(`${this.orderItemsPath}/${id}`));
  }

  create(payload: OrderItem): Observable<OrderItem> {
    return this.http.post<OrderItem>(this.buildUrl(this.orderItemsPath), payload);
  }

  update(id: string, payload: OrderItem): Observable<OrderItem> {
    return this.http.put<OrderItem>(this.buildUrl(`${this.orderItemsPath}/${id}`), payload);
  }

  setAsInactive(id: string): Observable<OrderItem> {
    return this.http.patch<OrderItem>(this.buildUrl(`${this.orderItemsPath}/${id}/set-as-inactive`), {});
  }
}
