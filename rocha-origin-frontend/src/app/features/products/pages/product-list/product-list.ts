import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../../../../core/models/product.model';
import {
  ListFilterOption,
  ListFiltersComponent,
} from '../../../../shared/components/list-filters/list-filters.component';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { ProductCreateDialogComponent } from './product-create-dialog';
import { ProductService } from '../../services/product.service';

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
  imports: [CommonModule, ListPageComponent, ListFiltersComponent, ...MATERIAL_MODULES],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  searchText = '';
  categoryFilter = 'ALL';
  vatFilter = 'ALL';
  sortColumn: 'name' | 'category' | 'defaultPrice' | 'status' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  categoryOptions: string[] = [];
  vatOptions: ListFilterOption[] = [];

  readonly displayedColumns = [
    'name',
    'category',
    'defaultUnit',
    'defaultPrice',
    'vatRate',
    'status',
  ];

  private allRows: ProductListRow[] = [];

  readonly dataSource = new MatTableDataSource<ProductListRow>([]);

  constructor(
    private readonly dialog: MatDialog,
    private readonly productService: ProductService,
  ) {
    this.reloadRows();
    this.refreshFilterOptions();
    this.applyFilters();
  }

  onAddProduct(): void {
    const dialogRef = this.dialog.open(ProductCreateDialogComponent, {
      width: '860px',
      maxWidth: '96vw',
      autoFocus: false,
      data: {
        categories: this.productService.getCategories(),
      },
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) {
        return;
      }

      this.productService.create(payload);
      this.reloadRows();
      this.refreshFilterOptions();
      this.applyFilters();
    });
  }

  setCategoryFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.categoryFilter = next || 'ALL';
  }

  setVatFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.vatFilter = next || 'ALL';
  }

  clearFilters(): void {
    this.searchText = '';
    this.categoryFilter = 'ALL';
    this.vatFilter = 'ALL';
    this.sortColumn = 'name';
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  onHeaderSort(column: 'name' | 'category' | 'defaultPrice' | 'status'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applyFilters();
  }

  sortIcon(column: 'name' | 'category' | 'defaultPrice' | 'status'): string {
    if (this.sortColumn !== column) {
      return 'unfold_more';
    }

    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();

    const filtered = this.allRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.internalCode.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query);

      const matchesCategory =
        this.categoryFilter === 'ALL' || row.category === this.categoryFilter;

      const matchesVat =
        this.vatFilter === 'ALL' || row.vatRate === Number(this.vatFilter);

      return matchesSearch && matchesCategory && matchesVat;
    });

    this.dataSource.data = this.applySort(filtered);
  }

  private applySort(rows: ProductListRow[]): ProductListRow[] {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      if (this.sortColumn === 'name') {
        return a.name.localeCompare(b.name, 'pt');
      }
      if (this.sortColumn === 'category') {
        return a.category.localeCompare(b.category, 'pt');
      }
      if (this.sortColumn === 'defaultPrice') {
        return a.defaultPrice - b.defaultPrice;
      }

      return a.status.localeCompare(b.status, 'pt');
    });

    if (this.sortDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }

  private refreshFilterOptions(): void {
    this.categoryOptions = Array.from(
      new Set(this.allRows.map((row) => row.category).filter((value) => value && value !== '-')),
    ).sort((a, b) => a.localeCompare(b, 'pt'));

    this.vatOptions = Array.from(new Set(this.allRows.map((row) => row.vatRate)))
      .sort((a, b) => a - b)
      .map((rate) => ({
        value: String(rate),
        label: `${rate}%`,
      }));
  }

  private reloadRows(): void {
    this.allRows = this.productService.getAll().map((product) => ({
      id: product.id,
      name: product.name,
      internalCode: product.internalCode ?? '',
      category: product.category,
      defaultUnit: product.defaultUnit,
      defaultPrice: product.defaultPrice ?? 0,
      vatRate: product.defaultVatRate ?? 0,
      status: product.isActive ? 'Ativo' : 'Inativo',
      createdAt: product.createdAt,
    }));
  }
}
