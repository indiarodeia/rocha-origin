import { Injectable } from '@angular/core';
import { Order } from '../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];

  getAll(): Order[] {
    return this.orders;
  }
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.orders.push(newOrder);
    return newOrder;
  }
}
