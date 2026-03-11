import { Injectable } from '@angular/core';
import { MOCK_PRODUCTS } from '../../../core/mocks/product.mock';
import { Product } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly products: Product[] = [...MOCK_PRODUCTS];

  getAll(): Product[] {
    return [...this.products];
  }

  create(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: this.nextProductId(),
      createdAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  getCategories(): string[] {
    return Array.from(
      new Set(
        this.products
          .map((product) => product.category.trim())
          .filter((category) => category.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b, 'pt'));
  }

  private nextProductId(): string {
    const maxId = this.products.reduce((max, product) => {
      const numeric = Number(product.id.replace('pr', ''));
      if (!Number.isFinite(numeric)) {
        return max;
      }

      return Math.max(max, numeric);
    }, 0);

    return `pr${String(maxId + 1).padStart(3, '0')}`;
  }
}
