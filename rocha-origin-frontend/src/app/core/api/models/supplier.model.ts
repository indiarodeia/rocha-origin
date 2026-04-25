import { Address } from './address.model';

export interface Supplier {
  id: string;
  name: string;
  vatNumber?: string | null;
  vatRate?: number | null;
  explorationCode?: string | null;
  addressId?: string | null;
  address?: Address | null;
  phone?: string | null;
  email?: string | null;
  certifications?: string | null;
  profilePicture?: string | null;
  profileJson?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSupplierRequest {
  name: string;
  vatNumber?: string | null;
  vatRate?: number | null;
  explorationCode?: string | null;
  address?: Omit<Address, 'id'> | null;
  phone?: string | null;
  email?: string | null;
  certifications?: string | null;
  isActive: boolean;
}
