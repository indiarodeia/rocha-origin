import { Establishment } from './establishment.model';
import { PaymentType } from './types.model';

export interface Client {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  email?: string;
  isActive?: boolean;

  billingAddressId?: string;

  billingStreet?: string;
  billingDoorNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;

  defaultPaymentType?: PaymentType;
  defaultPaymentTypeId?: number;
  defaultPaymentTypeLabel?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  establishments?: Establishment[];
}
