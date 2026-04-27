import { Animal as ApiAnimal, Lot as ApiLot, SaveLotRequest } from '../models';
import { mapApiAnimalToUiAnimal } from './animal.mapper';
import { Lot as UiLot } from '../../models/lot.model';

export interface LotUpsertInput {
  lotCode: string;
  year: number;
  month: number;
  weekOfMonth: number;
  startDate: string;
  endDate: string;
  notes?: string;
  isActive: boolean;
}

export function mapApiLotToUiLot(apiLot: ApiLot): UiLot {
  return {
    id: apiLot.id,
    lotCode: apiLot.lotCode,
    year: apiLot.year,
    month: apiLot.month,
    weekOfMonth: apiLot.weekOfMonth,
    startDate: apiLot.startDate,
    endDate: apiLot.endDate,
    notes: apiLot.notes ?? undefined,
    createdAt: apiLot.createdAt,
    animals: Array.isArray(apiLot.animals)
      ? apiLot.animals.map((animal: ApiAnimal) => mapApiAnimalToUiAnimal(animal))
      : undefined,
  };
}

export function mapLotToSaveRequest(input: LotUpsertInput): SaveLotRequest {
  return {
    lotCode: input.lotCode.trim(),
    year: input.year,
    month: input.month,
    weekOfMonth: input.weekOfMonth,
    startDate: input.startDate,
    endDate: input.endDate,
    notes: toNullableString(input.notes),
    isActive: input.isActive,
  };
}

function toNullableString(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}
