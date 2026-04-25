import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { Order } from '../../../../core/models/order.model';
import { OrderItem } from '../../../../core/models/order-item.model';
import { OrderStatus } from '../../../../core/models/types.model';
import { OrderItemsService } from '../../../../core/services/order-items.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface OrderDetailDialogData {
  orderId: string;
}

interface OrderItemRow {
  id: string;
  productName: string;
  requestedSummary: string;
  preparedSummary: string;
  status: OrderStatus;
  statusLabel: string;
  traceabilitySummary: string;
  notesSummary: string;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ...MATERIAL_MODULES],
  templateUrl: './order-detail-dialog.html',
  styleUrl: './order-detail-dialog.scss',
})
export class OrderDetailDialogComponent implements OnInit {
  readonly displayedColumns = [
    'productName',
    'requested',
    'prepared',
    'status',
    'traceability',
    'notes',
  ];

  readonly dataSource = new MatTableDataSource<OrderItemRow>([]);

  isLoading = true;
  isEmpty = false;
  hasError = false;
  errorMessage = '';
  emptyMessage = 'Não existem itens nesta encomenda.';
  order?: Order;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: OrderDetailDialogData,
    private readonly ordersService: OrdersService,
    private readonly orderItemsService: OrderItemsService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  statusClass(status: OrderStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  private load(): void {
    this.isLoading = true;
    this.isEmpty = false;
    this.hasError = false;
    this.errorMessage = '';
    this.order = undefined;
    this.dataSource.data = [];

    forkJoin({
      order: this.ordersService.getById(this.data.orderId),
      items: this.orderItemsService.getByOrderId(this.data.orderId),
    }).subscribe({
      next: ({ order, items }) => {
        this.isLoading = false;
        this.hasError = false;
        this.order = order;
        this.dataSource.data = items.map((item) => this.toRow(item));
        this.isEmpty = this.dataSource.data.length === 0;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.isEmpty = false;
        this.order = undefined;
        this.errorMessage = 'Não foi possível carregar o detalhe da encomenda.';
      },
    });
  }

  private toRow(item: OrderItem): OrderItemRow {
    return {
      id: item.id,
      productName: item.productName,
      requestedSummary: this.buildRequestedSummary(item),
      preparedSummary: this.buildPreparedSummary(item),
      status: item.status,
      statusLabel: item.statusLabel ?? this.fallbackStatusLabel(item.status),
      traceabilitySummary: this.buildTraceabilitySummary(item),
      notesSummary: this.buildNotesSummary(item),
    };
  }

  private buildRequestedSummary(item: OrderItem): string {
    const base = `${this.formatNumber(item.requestedQuantity)} ${item.requestedUnitLabel ?? item.requestedUnit}`;
    if (!item.approxKgPerUnit) {
      return base;
    }

    return `${base} · Aprox. ${this.formatNumber(item.approxKgPerUnit)} kg/un`;
  }

  private buildPreparedSummary(item: OrderItem): string {
    const preparedParts = [
      item.preparedQuantity != null && (item.preparedUnitLabel ?? item.preparedUnit)
        ? `${this.formatNumber(item.preparedQuantity)} ${item.preparedUnitLabel ?? item.preparedUnit}`
        : '',
      item.preparedWeightKg != null ? `${this.formatNumber(item.preparedWeightKg)} kg` : '',
    ].filter(Boolean);

    if (preparedParts.length === 0) {
      return '-';
    }

    return preparedParts.join(' · ');
  }

  private buildTraceabilitySummary(item: OrderItem): string {
    const parts = [item.traceabilitySourceLabel ?? 'Sem rastreabilidade'];

    if (item.animalIdentification) {
      parts.push(`Animal ${item.animalIdentification}`);
    }

    if (item.lotCode) {
      parts.push(`Lote ${item.lotCode}`);
    }

    return parts.join(' · ');
  }

  private buildNotesSummary(item: OrderItem): string {
    const parts = [item.requestNotes, item.prepNotes].filter((value) => !!value?.trim());

    return parts.length > 0 ? parts.join(' · ') : '-';
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

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-PT', {
      maximumFractionDigits: 2,
    }).format(value);
  }
}
