import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MOCK_ESTABLISHMENTS,
  MOCK_ORDER_ITEMS,
  MOCK_ORDERS,
  MOCK_ROUTES,
} from '../../../../core/mocks/order.mock';
import { OrderStatus } from '../../../../core/models/types.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface OrderListRow {
  id: string;
  restaurant: string;
  route: string;
  status: OrderStatus;
  deliveryDateTime: string;
  isDelivery: boolean;
  isUrgent: boolean;
  products: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList {
  readonly displayedColumns = [
    'id',
    'restaurant',
    'route',
    'products',
    'status',
    'deliveryDateTime',
    'flags',
  ];

  readonly dataSource = new MatTableDataSource<OrderListRow>(
    MOCK_ORDERS.map((order) => {
      const establishment = MOCK_ESTABLISHMENTS.find((item) => item.id === order.establishmentId);
      const route = MOCK_ROUTES.find((item) => item.id === order.routeId);
      const items = MOCK_ORDER_ITEMS.filter((item) => item.orderId === order.id);

      return {
        id: order.id,
        restaurant: order.quickClientName ?? establishment?.name ?? `Cliente ${order.clientId}`,
        route: route?.name ?? order.routeId ?? '-',
        status: order.status,
        deliveryDateTime: order.deliveryDateTime ?? order.deliveryDate ?? '-',
        isDelivery: !!order.isDelivery,
        isUrgent: !!order.isUrgent,
        products: items.map((item) => item.productName).join(', '),
      };
    }),
  );

  trackById(_: number, row: OrderListRow): string {
    return row.id;
  }

  statusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Pendente',
      PREPARING: 'Em preparacao',
      READY: 'Pronta',
      DELIVERED: 'Entregue',
    };

    return labels[status];
  }

  statusClass(status: OrderStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  onAddOrder(): void {
    // Placeholder until order creation flow exists.
    console.log('Criar nova encomenda');
  }
}
