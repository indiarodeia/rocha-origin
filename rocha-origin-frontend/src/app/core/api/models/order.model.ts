import { Client } from './client.model';
import { DeliveryType } from './delivery-type.model';
import { Establishment } from './establishment.model';
import { OrderStatus } from './order-status.model';
import { PaymentType } from './payment-type.model';
import { Route } from './route.model';

export interface Order {
  id: string;
  clientId: string;
  client?: Client | null;
  establishmentId?: string | null;
  establishment?: Establishment | null;
  quickClientName?: string | null;
  orderStatusId: number;
  status?: OrderStatus | null;
  prepDate?: string | null;
  deliveryDate?: string | null;
  deliveryDeadlineTime?: string | null;
  deliveryTypeId: number;
  deliveryType?: DeliveryType | null;
  isUrgent: boolean;
  orderCategory?: string | null;
  routeId?: string | null;
  route?: Route | null;
  paymentTypeId: number;
  paymentType?: PaymentType | null;
  notes?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
