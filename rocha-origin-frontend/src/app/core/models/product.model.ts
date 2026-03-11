export interface Product {
  id: string;

  name: string;
  category: string;

  defaultUnit: 'KG' | 'UN';

  defaultVatRate?: number;

  internalCode?: string;
  description?: string;

  defaultPrice?: number;
  defaultApproxKgPerUnit?: number;

  isActive: boolean;

  createdAt: string;
}
