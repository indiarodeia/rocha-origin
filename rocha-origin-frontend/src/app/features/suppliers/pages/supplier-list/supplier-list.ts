import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { SuppliersService } from '../../services/supplier.service';

interface SupplierListRow {
  id: string;
  name: string;
  vatNumber: string;
  explorationCode: string;
  city: string;
  phone: string;
  email: string;
  certifications: string;
  createdAt: string;
}

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss',
})
export class SupplierList {
  searchText = '';
  cityFilter = 'ALL';
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC' = 'NAME_ASC';

  pageIndex = 0;
  readonly pageSize = 20;
  totalCount = 0;
  isLoading = true;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  emptyMessage = 'Não existem fornecedores para os filtros aplicados.';
  listReady = false;

  readonly displayedColumns = ['name', 'explorationCode', 'city', 'phone', 'certifications'];

  readonly dataSource = new MatTableDataSource<SupplierListRow>([]);

  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly snackBar: MatSnackBar,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadSuppliers();
    });
  }

  onAddSupplier(): void {
    this.snackBar.open('Criação de fornecedores em breve disponível.', 'Fechar', { duration: 2800 });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.errorMessage = '';
    this.dataSource.data = [];

    this.suppliersService
      .search({
        searchText: this.searchText,
        city: this.cityFilter === 'ALL' ? null : this.cityFilter,
        sortBy: this.sortBy,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: ({ items, totalCount }) => {
          this.isLoading = false;
          this.totalCount = totalCount;
          const rows = items.map((s) => ({
            id: s.id,
            name: s.name,
            vatNumber: s.vatNumber ?? '-',
            explorationCode: s.explorationCode ?? '-',
            city: s.addressCity ?? '-',
            phone: s.phone ?? '-',
            email: s.email ?? '',
            certifications: s.certifications ?? '-',
            createdAt: s.createdAt,
          }));

          this.isEmpty = rows.length === 0;
          this.dataSource.data = rows;
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
          this.isEmpty = false;
          this.totalCount = 0;
          this.dataSource.data = [];
          this.errorMessage = 'Não foi possível carregar os fornecedores. Tente novamente.';
        },
      });
  }
}
