import { Animal } from './animal.model';

export interface Supplier {
  id: string;
  name: string;

  vatNumber?: string;
  vatRate?: number;
  explorationCode?: string;

  addressStreet?: string;
  addressPostalCode?: string;
  addressCity?: string;

  phone?: string;
  email?: string;

  certifications?: string;
  profilePicture?: string;
  profileJson?: string; // For future use in Meatazores

  createdAt: string;

  animals?: Animal[];
}
