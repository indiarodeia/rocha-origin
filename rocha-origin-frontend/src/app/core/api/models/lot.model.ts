import { Animal } from './animal.model';

export interface Lot {
  id: string;
  lotCode: string;
  year: number;
  month: number;
  weekOfMonth: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string | null;
  isActive?: boolean;
  animals?: Animal[] | null;
}

export interface SaveLotRequest {
  lotCode: string;
  year: number;
  month: number;
  weekOfMonth: number;
  startDate: string;
  endDate: string;
  notes?: string | null;
  isActive: boolean;
}

export interface AddAnimalsToLotRequest {
  animalIds?: string[] | null;
}

export interface RemoveAnimalsFromLotRequest {
  animalIds?: string[] | null;
}
