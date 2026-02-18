export type Species = 'BOVINO' | 'OVINO';

export type EuropConformation = 'S' | 'E' | 'U' | 'R' | 'O' | 'P';
export type EuropFatClass = 1 | 2 | 3 | 4 | 5;
export type EuropCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Animal {
  id: string;
  species: Species;
  animalIdentification: string;
  slaughterDate: string;
  dispatchDate: string;
  arrivalDate: string;
  birthPlace?: string;
  rearingPlace?: string;
  breed?: string;
  supplierId?: string;
  coldWeightKg?: number;
  ageMonths?: number;
  europConformation?: EuropConformation;
  europFatClass?: EuropFatClass;
  europCategory?: EuropCategory;
  europRaw?: string;
  slaughterhouseRef?: string;
  notes?: string;
  createdAt: string;
}
