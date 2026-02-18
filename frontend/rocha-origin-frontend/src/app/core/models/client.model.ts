export interface Client {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  email?: string;

  // Billing address
  billingStreet?: string;
  billingDoorNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
