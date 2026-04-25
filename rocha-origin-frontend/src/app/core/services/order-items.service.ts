import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  mapApiOrderItemToUiOrderItem,
  mapUiOrderItemToApiOrderItem,
  OrderItemCreateContext,
} from '../api/mappers/order-item.mapper';
import { ProductUnit, TraceabilitySourceType } from '../api/models';
import { OrderItemApiService } from '../api/services/order-item-api.service';
import { ReferenceDataApiService } from '../api/services/reference-data-api.service';
import { OrderItem } from '../models/order-item.model';

@Injectable({
  providedIn: 'root',
})
export class OrderItemsService {
  constructor(
    private readonly orderItemApiService: OrderItemApiService,
    private readonly referenceDataApiService: ReferenceDataApiService,
  ) {}

  getByOrderId(orderId: string): Observable<OrderItem[]> {
    return this.orderItemApiService
      .getByOrderId(orderId)
      .pipe(map((items) => items.map(mapApiOrderItemToUiOrderItem)));
  }

  getById(id: string): Observable<OrderItem> {
    return this.orderItemApiService.getById(id).pipe(map(mapApiOrderItemToUiOrderItem));
  }

  create(payload: OrderItem, context: OrderItemCreateContext): Observable<OrderItem> {
    return this.orderItemApiService
      .create(mapUiOrderItemToApiOrderItem(payload, context))
      .pipe(map(mapApiOrderItemToUiOrderItem));
  }

  getProductUnits(): Observable<ProductUnit[]> {
    return this.referenceDataApiService.getProductUnits().pipe(
      map((units) => [...units].filter((unit) => unit.isActive).sort((a, b) => a.order - b.order)),
    );
  }

  getTraceabilitySourceTypes(): Observable<TraceabilitySourceType[]> {
    return this.referenceDataApiService.getTraceabilitySourceTypes().pipe(
      map((types) => [...types].filter((type) => type.isActive).sort((a, b) => a.order - b.order)),
    );
  }
}
