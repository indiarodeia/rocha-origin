import { OrderItem } from './order-item.model';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';

export type UnitType = 'KG' | 'UN';

export interface Order {
  id: string;

  clientId: string;
  establishmentId?: string;
  quickClientName?: string;
  status: OrderStatus;
  prepDate: string; // ISO date
  deliveryDate: string; // ISO date
  deliveryDeadlineTime: string; // HH:mm
  isUrgent: boolean;
  orderCategory?: string;
  routeId?: string;
  notes?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
