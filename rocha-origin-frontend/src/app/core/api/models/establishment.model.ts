import { Address } from './address.model';
import { Client } from './client.model';
import { Route } from './route.model';

export interface EstablishmentMenuItem {
  id: string;
  establishmentId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Establishment {
  id: string;
  clientId: string;
  client?: Client | null;
  name: string;
  isActive: boolean;
  deliveryAddressId: string | null;
  deliveryAddress?: Address | null;
  routeId: string | null;
  route?: Route | null;
  localContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
  establishmentMenuItems?: EstablishmentMenuItem[] | null;
}

export interface SaveEstablishmentRequest {
  clientId: string;
  name: string;
  isActive: boolean;
  deliveryAddressId?: string | null;
  deliveryAddress?: Omit<Address, 'id'> | null;
  routeId?: string | null;
  localContactPhone?: string | null;
}
