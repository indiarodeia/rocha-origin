import { Address } from './address.model';
import { PaymentType } from './payment-type.model';

export interface Client {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  email: string;
  isActive: boolean;
  billingAddressId: string | null;
  billingAddress?: Address | null;
  notes: string | null;
  paymentTypeId: number;
  paymentType?: PaymentType | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveClientRequest {
  companyName: string;
  vatNumber: string;
  phone: string;
  email: string;
  isActive: boolean;
  billingAddressId?: string | null;
  billingAddress?: Omit<Address, 'id'> | null;
  notes?: string | null;
  paymentTypeId: number;
}
