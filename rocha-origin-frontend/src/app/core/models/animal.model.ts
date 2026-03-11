import { EuropCategory, EuropConformation, EuropFatClass, Species } from './types.model';

export interface Animal {
  id: string;

  species: Species;
  animalIdentification: string;

  supplierId?: string;

  slaughterDate?: string;
  dispatchDate?: string;
  arrivalDate?: string;

  birthPlace?: string;
  rearingPlace?: string;
  breed?: string;

  coldWeightKg?: number;
  ageMonths?: number;

  europConformation?: EuropConformation;
  europFatClass?: EuropFatClass;
  europCategory?: EuropCategory;
  europRaw?: string;

  slaughterhouseRef?: string;

  purchasePriceTotal?: number;
  purchasePricePerKg?: number;

  notes?: string;

  createdAt: string;

  lotId?: string;
}
