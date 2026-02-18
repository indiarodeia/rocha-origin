export interface Supplier {
  id: string;
  name: string;
  vatNumber?: string;
  explorationId?: string;
  addressStreet?: string;
  addressPostalCode?: string;
  addressCity?: string;
  island?: string;
  phone?: string;
  email?: string;
  profileJson?: any; // for extended Meat Azores content
  createdAt: string;
}
