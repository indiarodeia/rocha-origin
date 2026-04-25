export interface Animal {
  id: string;
  animalIdentification: string;
  species?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  slaughterDate?: string | null;
  dispatchDate?: string | null;
  arrivalDate?: string | null;
  birthPlace?: string | null;
  rearingPlace?: string | null;
  breed?: string | null;
  coldWeightKg?: number | null;
  ageMonths?: number | null;
  europConformation?: string | null;
  europFatClass?: number | null;
  europCategory?: string | null;
  europRaw?: string | null;
  slaughterhouseRef?: string | null;
  purchasePriceTotal?: number | null;
  purchasePricePerKg?: number | null;
  notes?: string | null;
  lotId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveAnimalRequest {
  animalIdentification: string;
  species?: string | null;
  supplierId?: string | null;
  slaughterDate?: string | null;
  dispatchDate?: string | null;
  arrivalDate?: string | null;
  birthPlace?: string | null;
  rearingPlace?: string | null;
  breed?: string | null;
  coldWeightKg?: number | null;
  ageMonths?: number | null;
  europConformation?: string | null;
  europFatClass?: number | null;
  europCategory?: string | null;
  europRaw?: string | null;
  slaughterhouseRef?: string | null;
  purchasePriceTotal?: number | null;
  purchasePricePerKg?: number | null;
  notes?: string | null;
  lotId?: string | null;
  isActive: boolean;
}
