import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import {
  MOCK_ESTABLISHMENTS,
  MOCK_ORDER_ITEMS,
  MOCK_ORDERS,
  MOCK_ROUTES,
} from '../../../../core/mocks/order.mock';
import { OrderStatus } from '../../../../core/models/types.model';
import {
  ListFilterOption,
  ListFiltersComponent,
} from '../../../../shared/components/list-filters/list-filters.component';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface OrderListRow {
  id: string;
  restaurant: string;
  routeId: string;
  routeName: string;
  status: OrderStatus;
  deliveryDateTime: string;
  isDelivery: boolean;
  isUrgent: boolean;
  products: string;
  deliveryTimestamp: number;
}

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ListPageComponent, ListFiltersComponent, ...MATERIAL_MODULES],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList {
  searchText = '';
  selectedRouteIds: string[] = [];
  selectedStatuses: OrderStatus[] = [];
  typeFilter: 'ALL' | 'DELIVERY' | 'PICKUP' = 'ALL';
  hideDelivered = false;
  deliverySortDirection: 'asc' | 'desc' = 'asc';

  readonly routeFilterOptions: ListFilterOption[] = MOCK_ROUTES.map((route) => ({
    value: route.id,
    label: route.name,
  }));
  readonly statusFilterOptions: ListFilterOption[] = [
    { value: 'PENDING', label: this.statusLabel('PENDING') },
    { value: 'PREPARING', label: this.statusLabel('PREPARING') },
    { value: 'READY', label: this.statusLabel('READY') },
    { value: 'DELIVERED', label: this.statusLabel('DELIVERED') },
  ];
  readonly typeFilterOptions: ListFilterOption[] = [
    { value: 'DELIVERY', label: 'Entrega' },
    { value: 'PICKUP', label: 'Recolha' },
  ];

  readonly displayedColumns = [
    'restaurant',
    'route',
    'products',
    'status',
    'deliveryDateTime',
    'flags',
  ];

  private readonly allRows: OrderListRow[] =
    MOCK_ORDERS.map((order) => {
      const establishment = MOCK_ESTABLISHMENTS.find((item) => item.id === order.establishmentId);
      const route = MOCK_ROUTES.find((item) => item.id === order.routeId);
      const items = MOCK_ORDER_ITEMS.filter((item) => item.orderId === order.id);
      const deliveryTimestamp = this.toTimestamp(order.deliveryDateTime ?? order.deliveryDate ?? '');

      return {
        id: order.id,
        restaurant: order.quickClientName ?? establishment?.name ?? `Cliente ${order.clientId}`,
        routeId: order.routeId ?? '-',
        routeName: route?.name ?? order.routeId ?? '-',
        status: order.status,
        deliveryDateTime: order.deliveryDateTime ?? order.deliveryDate ?? '-',
        isDelivery: !!order.isDelivery,
        isUrgent: !!order.isUrgent,
        products: items.map((item) => item.productName).join(', '),
        deliveryTimestamp,
      };
    });

  readonly dataSource = new MatTableDataSource<OrderListRow>([]);

  constructor(private readonly router: Router) {
    this.applyFilters();
  }

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

  routeChipClass(routeId: string): string {
    return `route-${routeId.toLowerCase()}`;
  }

  toggleDeliverySort(): void {
    this.deliverySortDirection = this.deliverySortDirection === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  deliverySortIcon(): string {
    return this.deliverySortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRouteIds = [];
    this.selectedStatuses = [];
    this.typeFilter = 'ALL';
    this.hideDelivered = false;
    this.deliverySortDirection = 'asc';
    this.applyFilters();
  }

  setSelectedRouteIds(value: string | string[]): void {
    this.selectedRouteIds = Array.isArray(value) ? value : value ? [value] : [];
  }

  setSelectedStatuses(value: string | string[]): void {
    const raw = Array.isArray(value) ? value : value ? [value] : [];
    this.selectedStatuses = raw as OrderStatus[];
  }

  setTypeFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.typeFilter = (next as 'ALL' | 'DELIVERY' | 'PICKUP') || 'ALL';
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();

    const filtered = this.allRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.id.toLowerCase().includes(query) ||
        row.restaurant.toLowerCase().includes(query) ||
        row.products.toLowerCase().includes(query);

      const matchesRoute =
        this.selectedRouteIds.length === 0 || this.selectedRouteIds.includes(row.routeId);

      const matchesStatus =
        this.selectedStatuses.length === 0 || this.selectedStatuses.includes(row.status);

      const matchesType =
        this.typeFilter === 'ALL' ||
        (this.typeFilter === 'DELIVERY' && row.isDelivery) ||
        (this.typeFilter === 'PICKUP' && !row.isDelivery);
      const matchesDelivered = !this.hideDelivered || row.status !== 'DELIVERED';

      return (
        matchesSearch &&
        matchesRoute &&
        matchesStatus &&
        matchesType &&
        matchesDelivered
      );
    });

    filtered.sort((a, b) => {
      const diff = a.deliveryTimestamp - b.deliveryTimestamp;
      return this.deliverySortDirection === 'asc' ? diff : -diff;
    });

    this.dataSource.data = filtered;
  }

  private toTimestamp(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  onAddOrder(): void {
    this.router.navigate(['/nova-encomenda']);
  }
}
