export interface Establishment {
  id: string;
  clientId: string;

  name: string;

  // Delivery address
  deliveryStreet: string;
  deliveryDoorNumber?: string;
  deliveryPostalCode: string;
  deliveryCity: string;

  routeId?: string; // default route
  localContact?: string;

  createdAt: string;
  updatedAt: string;
}
