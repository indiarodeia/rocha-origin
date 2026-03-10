import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_PRODUCTS } from '../../../../core/mocks/product.mock';
import { Product } from '../../../../core/models/product.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface ProductListRow {
  id: string;
  name: string;
  category: string;
  defaultUnit: Product['defaultUnit'];
  defaultPrice: number;
  vatRate: number;
  status: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  readonly displayedColumns = [
    'id',
    'name',
    'category',
    'defaultUnit',
    'defaultPrice',
    'vatRate',
    'status',
  ];

  readonly dataSource = new MatTableDataSource<ProductListRow>(
    MOCK_PRODUCTS.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      defaultUnit: product.defaultUnit,
      defaultPrice: product.defaultPrice ?? 0,
      vatRate: product.defaultVatRate ?? 0,
      status: product.isActive ? 'Ativo' : 'Inativo',
    })),
  );

  onAddProduct(): void {
    // Placeholder until product creation flow exists.
    console.log('Criar novo produto');
  }
}
