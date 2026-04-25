import { Animal } from './animal.model';
import { Lot } from './lot.model';
import { UnitType } from './types.model';
import { TraceabilitySourceType } from './types.model';
import { OrderStatus } from './types.model';

export interface OrderItem {
  id: string;

  orderId: string;

  productId?: string;
  productName: string;

  establishmentMenuItemId?: string;
  establishmentMenuItemName?: string;

  requestedQuantity: number;
  requestedUnit: UnitType;
  requestedUnitId?: number;
  requestedUnitLabel?: string;

  approxKgPerUnit?: number;

  requestNotes?: string;

  unitPrice?: number;
  priceUnit?: UnitType;
  priceUnitId?: number;
  priceUnitLabel?: string;
  vatRate?: number;

  preparedQuantity?: number;
  preparedUnit?: UnitType;
  preparedUnitId?: number;
  preparedUnitLabel?: string;
  preparedWeightKg?: number;

  traceabilitySourceType?: TraceabilitySourceType;
  traceabilitySourceTypeId?: number;
  traceabilitySourceLabel?: string;

  animalId?: string;
  lotId?: string;
  animalIdentification?: string;
  lotCode?: string;

  status: OrderStatus;
  apiOrderStatusId?: number;
  statusLabel?: string;

  note?: string;

  preparedAt?: string;
  preparedByUserId?: string;

  prepNotes?: string;

  animal?: Animal;
  lot?: Lot;
}
