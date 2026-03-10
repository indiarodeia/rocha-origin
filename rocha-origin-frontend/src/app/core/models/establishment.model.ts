export interface Establishment {
  id: string;
  clientId: string;

  name: string;
  isActive: boolean;

  deliveryStreet: string;
  deliveryDoorNumber?: string;
  deliveryPostalCode: string;
  deliveryCity: string;

  routeId?: string;

  localContactPhone?: string;

  createdAt: string;
  updatedAt: string;
}

export interface EstablishmentMenuItem {
  id: string;

  establishmentId: string;

  name: string;
  description?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}
