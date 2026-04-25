import { Animal as ApiAnimal, EstablishmentMenuItem as ApiEstablishmentMenuItem, Lot as ApiLot } from '../models';
import { TraceabilitySourceType, UnitType } from '../../models/types.model';

export { mapApiProductToUiProduct } from './product.mapper';

export interface OrderItemMenuItemOption {
  id: string;
  name: string;
}

export interface OrderItemAnimalOption {
  id: string;
  identification: string;
  breed?: string;
  slaughterDate?: string;
}

export interface OrderItemLotOption {
  id: string;
  label: string;
}

export interface OrderItemTraceabilityOption {
  value: TraceabilitySourceType;
  label: string;
}

export function mapApiAnimalToOrderItemAnimalOption(apiAnimal: ApiAnimal): OrderItemAnimalOption {
  return {
    id: apiAnimal.id,
    identification: apiAnimal.animalIdentification,
    breed: apiAnimal.breed ?? undefined,
    slaughterDate: apiAnimal.slaughterDate ?? undefined,
  };
}

export function mapApiLotToOrderItemLotOption(apiLot: ApiLot): OrderItemLotOption {
  return {
    id: apiLot.id,
    label: apiLot.lotCode,
  };
}

export function mapApiEstablishmentMenuItemToOption(
  apiItem: ApiEstablishmentMenuItem,
): OrderItemMenuItemOption {
  return {
    id: apiItem.id,
    name: apiItem.name,
  };
}

export function mapApiProductUnitLabelToUiUnit(label?: string | null): UnitType | null {
  const normalized = normalizeLabel(label);

  if (normalized === 'un' || normalized.includes('unidad')) {
    return 'UN';
  }

  if (normalized === 'kg' || normalized.includes('quilo')) {
    return 'KG';
  }

  return null;
}

export function mapApiTraceabilityLabelToOption(
  id: number,
  label?: string | null,
): OrderItemTraceabilityOption | null {
  const normalized = normalizeLabel(label);

  if (normalized.includes('animal')) {
    return { value: 'ANIMAL', label: label ?? 'Animal' };
  }

  if (normalized.includes('lot')) {
    return { value: 'LOT', label: label ?? 'Lote' };
  }

  if (normalized.includes('none') || normalized.includes('nenhum') || normalized.includes('sem')) {
    return { value: 'NONE', label: label ?? 'Nenhum' };
  }

  return id === 0 ? { value: 'NONE', label: label ?? 'Nenhum' } : null;
}

function normalizeLabel(label?: string | null): string {
  return (label ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}
