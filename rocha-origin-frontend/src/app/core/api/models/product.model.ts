import { ProductCategory } from './product-category.model';
import { ProductUnit } from './product-unit.model';

export interface Product {
  id: string;
  name: string;
  productCategoryId: number;
  category?: ProductCategory | null;
  defaultUnitId: number;
  defaultUnit?: ProductUnit | null;
  defaultVatRate?: number | null;
  defaultSellPrice?: number | null;
  internalCode?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProductRequest {
  name: string;
  productCategoryId: number;
  defaultUnitId: number;
  defaultVatRate: number | null;
  defaultSellPrice: number | null;
  internalCode: string | null;
  description: string | null;
  isActive: boolean;
}
