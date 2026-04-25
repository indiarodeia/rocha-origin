import { Order as UiOrder } from '../../models/order.model';
import { OrderStatus as UiOrderStatus, PaymentType as UiPaymentType } from '../../models/types.model';
import { Order as ApiOrder } from '../models';
import { buildRouteUiId } from './route.mapper';

export type SaveOrderRequest = Omit<ApiOrder, 'id'> & { id?: string };

export interface OrderCreateInput {
  clientId: string;
  establishmentId?: string | null;
  quickClientName?: string | null;
  orderStatusId: number;
  deliveryDate?: string | null;
  deliveryDeadlineTime?: string | null;
  deliveryTypeId: number;
  isUrgent: boolean;
  routeId?: string | null;
  paymentTypeId: number;
  notes?: string | null;
  createdByUserId?: string | null;
}

const ORDER_STATUS_FALLBACK_LABELS: Record<UiOrderStatus, string> = {
  PENDING: 'Pendente',
  PREPARING: 'Em preparacao',
  READY: 'Pronta',
  DELIVERED: 'Entregue',
};

export function mapApiOrderToUiOrder(apiOrder: ApiOrder): UiOrder {
  const status = mapApiOrderStatusToUiStatus(apiOrder.status?.label);
  const routeName = typeof apiOrder.route?.name === 'string' ? apiOrder.route.name : undefined;

  return {
    id: apiOrder.id,
    clientId: apiOrder.clientId,
    establishmentId: apiOrder.establishmentId ?? '',
    quickClientName: apiOrder.quickClientName ?? undefined,
    status,
    apiOrderStatusId: apiOrder.orderStatusId,
    statusLabel: apiOrder.status?.label ?? ORDER_STATUS_FALLBACK_LABELS[status],
    prepDate: apiOrder.prepDate ?? undefined,
    deliveryDate: apiOrder.deliveryDate ?? undefined,
    deliveryDateTime: buildDeliveryDateTime(apiOrder.deliveryDate, apiOrder.deliveryDeadlineTime),
    isDelivery: mapApiDeliveryTypeToIsDelivery(apiOrder.deliveryType?.label),
    deliveryTypeId: apiOrder.deliveryTypeId,
    deliveryTypeLabel: toOptionalString(apiOrder.deliveryType?.label),
    isUrgent: apiOrder.isUrgent,
    orderCategory: toOptionalString(apiOrder.orderCategory),
    routeId: routeName ? buildRouteUiId(routeName) : undefined,
    apiRouteId: apiOrder.routeId ?? undefined,
    routeName,
    paymentType: mapApiPaymentTypeLabelToUiKey(apiOrder.paymentType?.label),
    paymentTypeId: apiOrder.paymentTypeId,
    paymentTypeLabel: toOptionalString(apiOrder.paymentType?.label),
    notes: toOptionalString(apiOrder.notes),
    createdByUserId: toOptionalString(apiOrder.createdByUserId),
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
    isActive: apiOrder.isActive,
  };
}

export function mapOrderCreateInputToSaveOrderRequest(input: OrderCreateInput): SaveOrderRequest {
  const now = new Date().toISOString();

  return {
    clientId: input.clientId,
    establishmentId: input.establishmentId ?? null,
    quickClientName: toNullableString(input.quickClientName),
    orderStatusId: input.orderStatusId,
    prepDate: null,
    deliveryDate: input.deliveryDate ?? null,
    deliveryDeadlineTime: input.deliveryDeadlineTime ?? null,
    deliveryTypeId: input.deliveryTypeId,
    isUrgent: input.isUrgent,
    orderCategory: null,
    routeId: input.routeId ?? null,
    paymentTypeId: input.paymentTypeId,
    notes: toNullableString(input.notes),
    createdByUserId: toNullableUuid(input.createdByUserId),
    createdAt: now,
    updatedAt: now,
    isActive: true,
  };
}

export function mapApiOrderStatusToUiStatus(label?: string | null): UiOrderStatus {
  const normalized = normalizeLabel(label);

  if (normalized.includes('entreg')) {
    return 'DELIVERED';
  }

  if (normalized.includes('pront') || normalized.includes('ready')) {
    return 'READY';
  }

  if (normalized.includes('prepar')) {
    return 'PREPARING';
  }

  return 'PENDING';
}

function mapApiDeliveryTypeToIsDelivery(label?: string | null): boolean | undefined {
  const normalized = normalizeLabel(label);

  if (!normalized) {
    return undefined;
  }

  if (normalized.includes('recolh') || normalized.includes('pickup')) {
    return false;
  }

  if (normalized.includes('entreg') || normalized.includes('delivery')) {
    return true;
  }

  return undefined;
}

function mapApiPaymentTypeLabelToUiKey(label?: string | null): UiPaymentType | undefined {
  const normalized = normalizeLabel(label);

  if (!normalized) {
    return undefined;
  }

  if (normalized.includes('pronto') || normalized.includes('imediat')) {
    return 'IMMEDIATE';
  }

  if (normalized.includes('credit')) {
    return 'CREDIT';
  }

  if (normalized.includes('conta') || normalized.includes('customer')) {
    return 'CUSTOMER';
  }

  return undefined;
}

function buildDeliveryDateTime(
  deliveryDate?: string | null,
  deliveryDeadlineTime?: string | null,
): string | undefined {
  if (typeof deliveryDate !== 'string' || deliveryDate.trim().length === 0) {
    return undefined;
  }

  if (typeof deliveryDeadlineTime !== 'string' || deliveryDeadlineTime.trim().length === 0) {
    return deliveryDate;
  }

  const timeValue = deliveryDeadlineTime.split('.')[0];
  const datePart = deliveryDate.slice(0, 10);

  return `${datePart}T${timeValue}`;
}

function normalizeLabel(label?: string | null): string {
  return (typeof label === 'string' ? label : '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function toNullableString(value?: string | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableUuid(value?: string | null): string | null {
  const trimmed = (value ?? '').trim();
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(trimmed) ? trimmed : null;
}

function toOptionalString(value?: string | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
