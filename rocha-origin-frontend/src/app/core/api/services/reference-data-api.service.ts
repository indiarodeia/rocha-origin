import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import {
  DeliveryType,
  OrderStatus,
  PaymentType,
  ProductCategory,
  ProductUnit,
  TraceabilitySourceType,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReferenceDataApiService extends BaseApiService {
  getPaymentTypes(): Observable<PaymentType[]> {
    return this.http.get<PaymentType[]>(this.buildUrl('payment-types'));
  }

  getDeliveryTypes(): Observable<DeliveryType[]> {
    return this.http.get<DeliveryType[]>(this.buildUrl('delivery-types'));
  }

  getOrderStatuses(): Observable<OrderStatus[]> {
    return this.http.get<OrderStatus[]>(this.buildUrl('order-statuses'));
  }

  getProductUnits(): Observable<ProductUnit[]> {
    return this.http.get<ProductUnit[]>(this.buildUrl('product-units'));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(this.buildUrl('product-categories'));
  }

  getTraceabilitySourceTypes(): Observable<TraceabilitySourceType[]> {
    return this.http.get<TraceabilitySourceType[]>(this.buildUrl('traceability-source-types'));
  }
}
