export interface Establishment {
  id: string;
  clientId: string;
  clientName?: string;

  name: string;
  isActive: boolean;

  deliveryAddressId?: string;
  deliveryStreet: string;
  deliveryDoorNumber?: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryCountry?: string;

  routeId?: string;
  apiRouteId?: string;
  routeName?: string;

  localContactPhone?: string;

  createdAt: string;
  updatedAt: string;

  menuItems?: EstablishmentMenuItem[];
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

export interface EstablishmentProductPrice {
  establishmentId: string;
  productId: string;
  price: number;
}
