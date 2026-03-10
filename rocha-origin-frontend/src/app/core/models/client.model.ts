import { PaymentType } from './types.model';

export interface Client {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  email?: string;

  billingStreet?: string;
  billingDoorNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;

  defaultPaymentType?: PaymentType;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
