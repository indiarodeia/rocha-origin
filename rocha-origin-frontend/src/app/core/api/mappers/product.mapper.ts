import { Product as ApiProduct, SaveProductRequest } from '../models';
import { Product as UiProduct } from '../../models/product.model';
import { UnitType } from '../../models/types.model';

export interface ProductUpsertInput {
  name: string;
  productCategoryId: number;
  defaultUnitId: number;
  defaultVatRate?: number;
  defaultSellPrice?: number;
  internalCode?: string;
  description?: string;
  isActive: boolean;
}

export function mapApiProductToUiProduct(apiProduct: ApiProduct): UiProduct {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    category: apiProduct.category?.label ?? 'Sem categoria',
    defaultUnit: mapApiUnitLabelToUiUnit(apiProduct.defaultUnit?.label),
    defaultVatRate: apiProduct.defaultVatRate ?? undefined,
    internalCode: apiProduct.internalCode ?? undefined,
    description: apiProduct.description ?? undefined,
    defaultPrice: apiProduct.defaultSellPrice ?? undefined,
    defaultApproxKgPerUnit: undefined,
    isActive: apiProduct.isActive,
    createdAt: apiProduct.createdAt,
  };
}

export function mapProductToSaveRequest(input: ProductUpsertInput): SaveProductRequest {
  return {
    name: input.name.trim(),
    productCategoryId: input.productCategoryId,
    defaultUnitId: input.defaultUnitId,
    defaultVatRate: input.defaultVatRate ?? null,
    defaultSellPrice: input.defaultSellPrice ?? null,
    internalCode: toNullableString(input.internalCode),
    description: toNullableString(input.description),
    isActive: input.isActive,
  };
}

function mapApiUnitLabelToUiUnit(label?: string | null): UnitType {
  const normalized = (label ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

  if (normalized === 'un' || normalized.includes('unidad')) {
    return 'UN';
  }

  return 'KG';
}

function toNullableString(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}
