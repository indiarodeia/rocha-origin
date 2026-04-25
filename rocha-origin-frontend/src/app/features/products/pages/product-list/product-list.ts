import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { ProductUpsertInput } from '../../../../core/api/mappers/product.mapper';
import { ProductCategory, ProductUnit } from '../../../../core/api/models';
import { Product } from '../../../../core/models/product.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { ProductsService } from '../../services/product.service';
import { ProductCreateDialogComponent } from './product-create-dialog';

interface ProductListRow {
  id: string;
  name: string;
  internalCode: string;
  category: string;
  defaultUnit: Product['defaultUnit'];
  defaultPrice: number;
  vatRate: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  searchText = '';
  categoryFilter = 'ALL';
  vatFilter = 'ALL';
  sortColumn: 'name' | 'category' | 'defaultPrice' | 'status' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageIndex = 0;
  readonly pageSize = 20;
  totalCount = 0;
  isLoading = true;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  emptyMessage = 'Não existem produtos para os filtros aplicados.';
  listReady = false;

  categories: ProductCategory[] = [];
  units: ProductUnit[] = [];

  readonly displayedColumns = ['name', 'category', 'defaultUnit', 'defaultPrice', 'vatRate', 'status'];

  readonly dataSource = new MatTableDataSource<ProductListRow>([]);

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly productsService: ProductsService,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadRefData();
      this.loadProducts();
    });
  }

  onAddProduct(): void {
    if (this.units.length === 0) {
      this.snackBar.open(
        'Não foi possível carregar as unidades de produto. Tente novamente.',
        'Fechar',
        { duration: 3200 },
      );
      return;
    }

    const dialogRef = this.dialog.open(ProductCreateDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      autoFocus: false,
      data: {
        categories: this.categories,
        units: this.units,
      },
    });

    dialogRef.afterClosed().subscribe((payload: ProductUpsertInput | undefined) => {
      if (!payload) {
        return;
      }

      this.productsService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Produto criado com sucesso.', 'Fechar', { duration: 2800 });
          this.pageIndex = 0;
          this.loadProducts();
        },
        error: () => {
          this.snackBar.open('Não foi possível criar o produto. Tente novamente.', 'Fechar', {
            duration: 3200,
          });
        },
      });
    });
  }

  onHeaderSort(column: 'name' | 'category' | 'defaultPrice' | 'status'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.pageIndex = 0;
    this.loadProducts();
  }

  sortIcon(column: 'name' | 'category' | 'defaultPrice' | 'status'): string {
    if (this.sortColumn !== column) {
      return 'unfold_more';
    }

    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadProducts();
  }

  private loadRefData(): void {
    this.productsService.getProductCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => {
        this.categories = [];
      },
    });

    this.productsService.getProductUnits().subscribe({
      next: (units) => {
        this.units = units;
      },
      error: () => {
        this.units = [];
      },
    });
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.errorMessage = '';
    this.dataSource.data = [];

    this.productsService
      .search({
        searchText: this.searchText,
        categoryId: null,
        sortBy: this.toSortBy(),
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: ({ items, totalCount }) => {
          this.isLoading = false;
          this.totalCount = totalCount;
          this.dataSource.data = items.map((p) => this.toRow(p));
          this.isEmpty = this.dataSource.data.length === 0;
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
          this.isEmpty = false;
          this.totalCount = 0;
          this.dataSource.data = [];
          this.errorMessage = 'Não foi possível carregar os produtos. Tente novamente.';
        },
      });
  }

  private toSortBy(): 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC' {
    if (this.sortColumn === 'name' || this.sortColumn === 'category') {
      return this.sortDirection === 'asc' ? 'NAME_ASC' : 'NAME_DESC';
    }

    return this.sortDirection === 'asc' ? 'CREATED_ASC' : 'CREATED_DESC';
  }

  private toRow(product: Product): ProductListRow {
    return {
      id: product.id,
      name: product.name,
      internalCode: product.internalCode ?? '',
      category: product.category,
      defaultUnit: product.defaultUnit,
      defaultPrice: product.defaultPrice ?? 0,
      vatRate: product.defaultVatRate ?? 0,
      status: product.isActive ? 'Ativo' : 'Inativo',
      createdAt: product.createdAt,
    };
  }
}
