import { Animal } from './animal.model';

export interface Lot {
  id: string;

  lotCode: string; // ex: 20260201
  year: number;
  month: number;
  weekOfMonth: number;

  startDate: string;
  endDate: string;

  notes?: string;

  createdAt: string;

  animals?: Animal[];
}

export interface LotAnimal {
  lotId: string;
  animalId: string;
  addedAt?: string;
}
