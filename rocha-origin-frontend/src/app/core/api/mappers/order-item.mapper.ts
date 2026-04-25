import { OrderItem as UiOrderItem } from '../../models/order-item.model';
import { OrderStatus, TraceabilitySourceType, UnitType } from '../../models/types.model';
import { OrderItem as ApiOrderItem } from '../models';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  PREPARING: 'Em preparacao',
  READY: 'Pronta',
  DELIVERED: 'Entregue',
};

const TRACEABILITY_LABELS: Record<TraceabilitySourceType, string> = {
  NONE: 'Sem rastreabilidade',
  ANIMAL: 'Animal',
  LOT: 'Lote',
};

export interface OrderItemCreateContext {
  orderId: string;
  orderStatusId: number;
  requestedUnitId: number;
  priceUnitId: number;
  traceabilitySourceTypeId: number;
}

export function mapApiOrderItemToUiOrderItem(apiItem: ApiOrderItem): UiOrderItem {
  const status = mapApiStatusLabelToUiStatus(apiItem.status?.label);
  const requestedUnit = mapApiUnitLabelToUiUnit(apiItem.requestedUnit?.label);
  const priceUnit = mapApiUnitLabelToUiUnit(apiItem.priceUnit?.label);
  const preparedUnit = mapApiUnitLabelToUiUnit(apiItem.preparedUnit?.label);
  const traceabilitySourceType = mapApiTraceabilityLabelToUiType(apiItem.traceabilitySourceType?.label);

  return {
    id: apiItem.id,
    orderId: apiItem.orderId,
    productId: apiItem.productId ?? undefined,
    productName: apiItem.productName,
    establishmentMenuItemId: apiItem.establishmentMenuItemId ?? undefined,
    establishmentMenuItemName: apiItem.establishmentMenuItem?.name ?? undefined,
    requestedQuantity: apiItem.requestedQuantity,
    requestedUnit,
    requestedUnitId: apiItem.requestedUnitId,
    requestedUnitLabel: apiItem.requestedUnit?.label ?? requestedUnit,
    approxKgPerUnit: apiItem.approxKgPerUnit ?? undefined,
    requestNotes: apiItem.requestNotes ?? undefined,
    unitPrice: apiItem.unitPrice,
    priceUnit,
    priceUnitId: apiItem.priceUnitId,
    priceUnitLabel: apiItem.priceUnit?.label ?? priceUnit,
    preparedQuantity: apiItem.preparedQuantity ?? undefined,
    preparedUnit,
    preparedUnitId: apiItem.preparedUnitId ?? undefined,
    preparedUnitLabel: apiItem.preparedUnit?.label ?? undefined,
    preparedWeightKg: apiItem.preparedWeightKg ?? undefined,
    traceabilitySourceType,
    traceabilitySourceTypeId: apiItem.traceabilitySourceTypeId,
    traceabilitySourceLabel:
      apiItem.traceabilitySourceType?.label ?? TRACEABILITY_LABELS[traceabilitySourceType],
    animalId: apiItem.animalId ?? undefined,
    lotId: apiItem.lotId ?? undefined,
    status,
    apiOrderStatusId: apiItem.orderStatusId,
    statusLabel: apiItem.status?.label ?? ORDER_STATUS_LABELS[status],
    preparedAt: apiItem.preparedAt ?? undefined,
    preparedByUserId: apiItem.preparedByUserId ?? undefined,
    prepNotes: apiItem.prepNotes ?? undefined,
    animalIdentification: apiItem.animal?.animalIdentification ?? undefined,
    lotCode: apiItem.lot?.lotCode ?? undefined,
  };
}

export function mapUiOrderItemToApiOrderItem(
  uiItem: UiOrderItem,
  context: OrderItemCreateContext,
): ApiOrderItem {
  return {
    id: '',
    orderId: context.orderId,
    productId: toNullableUuid(uiItem.productId),
    productName: uiItem.productName,
    establishmentMenuItemId: toNullableUuid(uiItem.establishmentMenuItemId),
    requestedQuantity: uiItem.requestedQuantity,
    requestedUnitId: context.requestedUnitId,
    approxKgPerUnit: uiItem.approxKgPerUnit ?? null,
    requestNotes: toNullableString(uiItem.requestNotes),
    unitPrice: Number(uiItem.unitPrice ?? 0),
    priceUnitId: context.priceUnitId,
    preparedQuantity: null,
    preparedUnitId: null,
    preparedWeightKg: null,
    traceabilitySourceTypeId: context.traceabilitySourceTypeId,
    animalId: toNullableUuid(uiItem.animalId),
    lotId: toNullableUuid(uiItem.lotId),
    orderStatusId: context.orderStatusId,
    preparedAt: null,
    preparedByUserId: null,
    prepNotes: null,
  };
}

function mapApiUnitLabelToUiUnit(label?: string | null): UnitType {
  const normalized = normalizeLabel(label);
  return normalized.includes('un') ? 'UN' : 'KG';
}

function mapApiStatusLabelToUiStatus(label?: string | null): OrderStatus {
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

function mapApiTraceabilityLabelToUiType(label?: string | null): TraceabilitySourceType {
  const normalized = normalizeLabel(label);

  if (normalized.includes('animal')) {
    return 'ANIMAL';
  }

  if (normalized.includes('lot')) {
    return 'LOT';
  }

  return 'NONE';
}

function normalizeLabel(label?: string | null): string {
  return (label ?? '')
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
  if (!trimmed) {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : null;
}
