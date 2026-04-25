import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { Order } from '../../../../core/models/order.model';
import { OrderStatus } from '../../../../core/models/types.model';
import { OrdersService } from '../../../../core/services/orders.service';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { OrderDetailDialogComponent } from './order-detail-dialog';

interface OrderListRow {
  id: string;
  restaurant: string;
  routeId: string;
  routeName: string;
  status: OrderStatus;
  statusLabel: string;
  deliveryDateTime?: string;
  isDelivery?: boolean;
  isUrgent: boolean;
  products: string;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    ListPageComponent,
    MatDialogModule,
    ...MATERIAL_MODULES,
  ],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList {
  deliverySortDirection: 'asc' | 'desc' = 'asc';
  pageIndex = 0;
  readonly pageSize = 10;
  totalCount = 0;
  isLoading = true;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  emptyMessage = 'Não existem encomendas para os filtros aplicados.';
  listReady = false;

  readonly displayedColumns = [
    'restaurant',
    'route',
    'products',
    'status',
    'deliveryDateTime',
    'flags',
  ];

  readonly dataSource = new MatTableDataSource<OrderListRow>([]);

  constructor(
    private readonly router: Router,
    private readonly ordersService: OrdersService,
    private readonly dialog: MatDialog,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadOrders();
    });
  }

  trackById(_: number, row: OrderListRow): string {
    return row.id;
  }

  statusClass(status: OrderStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  routeChipClass(routeId: string): string {
    return `route-${routeId.toLowerCase()}`;
  }

  toggleDeliverySort(): void {
    this.deliverySortDirection = this.deliverySortDirection === 'asc' ? 'desc' : 'asc';
    this.loadOrders();
  }

  deliverySortIcon(): string {
    return this.deliverySortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadOrders();
  }

  onAddOrder(): void {
    this.router.navigate(['/nova-encomenda']);
  }

  openOrderDetail(row: OrderListRow): void {
    this.dialog.open(OrderDetailDialogComponent, {
      width: '1040px',
      maxWidth: '96vw',
      autoFocus: false,
      data: {
        orderId: row.id,
      },
    });
  }

  private loadOrders(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.errorMessage = '';
    this.dataSource.data = [];

    this.ordersService.search({
      searchText: '',
      statusIds: [],
      routeIds: [],
      deliveryTypeId: undefined,
      hideDelivered: false,
      sortDirection: this.deliverySortDirection,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    }).subscribe({
      next: ({ items, totalCount }) => {
        try {
          const safeItems = Array.isArray(items) ? items : [];
          const safeTotalCount = typeof totalCount === 'number' && Number.isFinite(totalCount)
            ? totalCount
            : safeItems.length;

          if (this.pageIndex > 0 && safeItems.length === 0 && safeTotalCount > 0) {
            this.pageIndex = Math.max(0, Math.ceil(safeTotalCount / this.pageSize) - 1);
            this.loadOrders();
            return;
          }

          this.totalCount = safeTotalCount;
          this.dataSource.data = safeItems.map((order) => this.toRow(order));
          this.hasError = false;
          this.isEmpty = safeItems.length === 0;
        } catch {
          this.totalCount = 0;
          this.dataSource.data = [];
          this.hasError = true;
          this.isEmpty = false;
          this.errorMessage = 'Não foi possível processar as encomendas recebidas.';
        } finally {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.isEmpty = false;
        this.totalCount = 0;
        this.dataSource.data = [];
        this.errorMessage = 'Não foi possível carregar as encomendas. Tente novamente.';
      },
    });
  }

  private toRow(order: Order): OrderListRow {
    const restaurantName = typeof order.quickClientName === 'string' && order.quickClientName.trim().length > 0
      ? order.quickClientName.trim()
      : `Cliente ${order.clientId}`;

    return {
      id: order.id,
      restaurant: restaurantName,
      routeId: order.routeId ?? '-',
      routeName: order.routeName ?? order.routeId ?? '-',
      status: order.status,
      statusLabel: order.statusLabel ?? this.fallbackStatusLabel(order.status),
      deliveryDateTime: order.deliveryDateTime ?? order.deliveryDate ?? undefined,
      isDelivery: order.isDelivery,
      isUrgent: !!order.isUrgent,
      products: this.buildProductsSummary(order),
    };
  }

  private buildProductsSummary(order: Order): string {
    const category = (order.orderCategory ?? '').trim();

    if (category) {
      return `Categoria: ${category}`;
    }

    return 'Sem detalhe de itens';
  }

  private fallbackStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Pendente',
      PREPARING: 'Em preparação',
      READY: 'Pronta',
      DELIVERED: 'Entregue',
    };

    return labels[status];
  }
}
