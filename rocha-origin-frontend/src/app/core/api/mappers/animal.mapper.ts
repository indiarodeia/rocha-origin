import { Animal as ApiAnimal, SaveAnimalRequest } from '../models';
import { Animal as UiAnimal } from '../../models/animal.model';
import { EuropCategory, EuropConformation, EuropFatClass, Species } from '../../models/types.model';

export interface AnimalUpsertInput {
  animalIdentification: string;
  species?: Species;
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
  lotId?: string;
  isActive: boolean;
}

export function mapApiAnimalToUiAnimal(apiAnimal: ApiAnimal): UiAnimal {
  return {
    id: apiAnimal.id,
    animalIdentification: apiAnimal.animalIdentification,
    species: toSpecies(apiAnimal.species),
    supplierId: apiAnimal.supplierId ?? undefined,
    slaughterDate: apiAnimal.slaughterDate ?? undefined,
    dispatchDate: apiAnimal.dispatchDate ?? undefined,
    arrivalDate: apiAnimal.arrivalDate ?? undefined,
    birthPlace: apiAnimal.birthPlace ?? undefined,
    rearingPlace: apiAnimal.rearingPlace ?? undefined,
    breed: apiAnimal.breed ?? undefined,
    coldWeightKg: apiAnimal.coldWeightKg ?? undefined,
    ageMonths: apiAnimal.ageMonths ?? undefined,
    europConformation: toEuropConformation(apiAnimal.europConformation),
    europFatClass: toEuropFatClass(apiAnimal.europFatClass),
    europCategory: toEuropCategory(apiAnimal.europCategory),
    europRaw: apiAnimal.europRaw ?? buildEuropRaw(apiAnimal),
    slaughterhouseRef: apiAnimal.slaughterhouseRef ?? undefined,
    purchasePriceTotal: apiAnimal.purchasePriceTotal ?? undefined,
    purchasePricePerKg: apiAnimal.purchasePricePerKg ?? undefined,
    notes: apiAnimal.notes ?? undefined,
    lotId: apiAnimal.lotId ?? undefined,
    createdAt: apiAnimal.createdAt,
  };
}

export function mapAnimalToSaveRequest(input: AnimalUpsertInput): SaveAnimalRequest {
  return {
    animalIdentification: input.animalIdentification.trim(),
    species: input.species ?? null,
    supplierId: input.supplierId ?? null,
    slaughterDate: input.slaughterDate ?? null,
    dispatchDate: input.dispatchDate ?? null,
    arrivalDate: input.arrivalDate ?? null,
    birthPlace: toNullableString(input.birthPlace),
    rearingPlace: toNullableString(input.rearingPlace),
    breed: toNullableString(input.breed),
    coldWeightKg: input.coldWeightKg ?? null,
    ageMonths: input.ageMonths ?? null,
    europConformation: input.europConformation ?? null,
    europFatClass: input.europFatClass ?? null,
    europCategory: input.europCategory ?? null,
    europRaw: toNullableString(input.europRaw),
    slaughterhouseRef: toNullableString(input.slaughterhouseRef),
    purchasePriceTotal: input.purchasePriceTotal ?? null,
    purchasePricePerKg: input.purchasePricePerKg ?? null,
    notes: toNullableString(input.notes),
    lotId: input.lotId ?? null,
    isActive: input.isActive,
  };
}

function buildEuropRaw(apiAnimal: ApiAnimal): string | undefined {
  if (!apiAnimal.europConformation || !apiAnimal.europFatClass || !apiAnimal.europCategory) {
    return undefined;
  }

  return `${apiAnimal.europConformation}${apiAnimal.europFatClass}${apiAnimal.europCategory}`;
}

function toSpecies(value?: string | null): Species {
  if (value === 'OVINO') {
    return 'OVINO';
  }

  return 'BOVINO';
}

function toEuropConformation(value?: string | null): EuropConformation | undefined {
  const valid: EuropConformation[] = ['S', 'E', 'U', 'R', 'O', 'P'];
  return valid.includes(value as EuropConformation) ? (value as EuropConformation) : undefined;
}

function toEuropFatClass(value?: number | null): EuropFatClass | undefined {
  const valid: EuropFatClass[] = [1, 2, 3, 4, 5];
  return valid.includes(value as EuropFatClass) ? (value as EuropFatClass) : undefined;
}

function toEuropCategory(value?: string | null): EuropCategory | undefined {
  const valid: EuropCategory[] = ['A', 'B', 'C', 'D', 'E'];
  return valid.includes(value as EuropCategory) ? (value as EuropCategory) : undefined;
}

function toNullableString(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}
