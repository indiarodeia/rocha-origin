import { OrderStatus } from './types.model';

export interface Order {
  id: string;

  clientId: string;
  establishmentId: string;

  quickClientName?: string;

  status: OrderStatus;

  prepDate?: string;
  deliveryDate?: string;
  deliveryDateTime?: string;

  isDelivery?: boolean;
  isUrgent?: boolean;

  orderCategory?: string;

  routeId?: string;

  paymentType?: 'IMMEDIATE' | 'CREDIT' | 'CUSTOMER';

  notes?: string;

  createdByUserId?: string;

  createdAt: string;
  updatedAt?: string;
}
