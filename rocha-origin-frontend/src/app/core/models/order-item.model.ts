import { UnitType } from './order.model';

export type TraceabilitySourceType = 'ANIMAL' | 'LOT' | 'NONE';

export interface OrderItem {
  id: string;
  orderId: string;

  productId?: string;
  productName: string;

  // Requested (what client ordered)
  requestedQuantity: number;
  requestedUnit: UnitType;
  approxKgPerUnit?: number;
  requestNotes?: string;

  unitPrice: number;
  priceUnit: UnitType;

  // Prepared (filled by butchery)
  preparedQuantity?: number;
  preparedUnit?: UnitType;
  preparedWeightKg?: number;

  traceabilitySourceType?: TraceabilitySourceType;
  animalId?: string;
  lotId?: string;

  preparedAt?: string;
  preparedByUserId?: string;
  prepNotes?: string;
}
