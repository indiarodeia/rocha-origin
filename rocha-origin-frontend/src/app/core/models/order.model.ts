import { OrderItem } from './order-item.model';
import { OrderStatus } from './types.model';

export interface Order {
  id: string;

  clientId: string;
  establishmentId: string;

  quickClientName?: string;

  status: OrderStatus;
  apiOrderStatusId?: number;
  statusLabel?: string;

  prepDate?: string;
  deliveryDate?: string;
  deliveryDateTime?: string;

  isDelivery?: boolean;
  deliveryTypeId?: number;
  deliveryTypeLabel?: string;
  isUrgent?: boolean;

  orderCategory?: string;

  routeId?: string;
  apiRouteId?: string;
  routeName?: string;

  paymentType?: 'IMMEDIATE' | 'CREDIT' | 'CUSTOMER';
  paymentTypeId?: number;
  paymentTypeLabel?: string;

  notes?: string;

  createdByUserId?: string;

  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;

  orderItems?: OrderItem[];
}
