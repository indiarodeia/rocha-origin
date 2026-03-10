import { UnitType } from './types.model';
import { TraceabilitySourceType } from './types.model';
import { OrderStatus } from './types.model';

export interface OrderItem {
  id: string;

  orderId: string;

  productId?: string;
  productName: string;

  establishmentMenuItemId?: string;

  requestedQuantity: number;
  requestedUnit: UnitType;

  approxKgPerUnit?: number;

  requestNotes?: string;

  unitPrice?: number;
  priceUnit?: UnitType;

  preparedQuantity?: number;
  preparedUnit?: UnitType;
  preparedWeightKg?: number;

  traceabilitySourceType?: TraceabilitySourceType;

  animalId?: string;
  lotId?: string;

  status: OrderStatus;

  note?: string;

  preparedAt?: string;
  preparedByUserId?: string;

  prepNotes?: string;
}
