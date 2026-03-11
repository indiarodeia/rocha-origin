import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_SUPPLIERS } from '../../../../core/mocks/supplier.mock';
import {
  ListFilterOption,
  ListFiltersComponent,
} from '../../../../shared/components/list-filters/list-filters.component';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

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
  imports: [CommonModule, ListPageComponent, ListFiltersComponent, ...MATERIAL_MODULES],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss',
})
export class SupplierList {
  searchText = '';
  cityFilter = 'ALL';
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC' = 'NAME_ASC';

  readonly cityOptions: string[];
  readonly sortOptions: ListFilterOption[] = [
    { value: 'NAME_ASC', label: 'Nome A-Z', icon: 'sort_by_alpha' },
    { value: 'NAME_DESC', label: 'Nome Z-A', icon: 'sort_by_alpha' },
    { value: 'CREATED_DESC', label: 'Mais recentes', icon: 'schedule' },
    { value: 'CREATED_ASC', label: 'Mais antigos', icon: 'history' },
  ];

  readonly displayedColumns = [
    'name',
    'explorationCode',
    'city',
    'phone',
    'certifications',
  ];

  private readonly allRows: SupplierListRow[] = MOCK_SUPPLIERS.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      vatNumber: supplier.vatNumber ?? '-',
      explorationCode: supplier.explorationCode ?? '-',
      city: supplier.addressCity ?? '-',
      phone: supplier.phone ?? '-',
      email: supplier.email ?? '',
      certifications: supplier.certifications ?? '-',
      createdAt: supplier.createdAt,
    }));

  readonly dataSource = new MatTableDataSource<SupplierListRow>([]);

  constructor() {
    this.cityOptions = Array.from(
      new Set(
        this.allRows
          .map((row) => row.city)
          .filter((city) => city && city !== '-'),
      ),
    ).sort((a, b) => a.localeCompare(b, 'pt'));

    this.applyFilters();
  }

  onAddSupplier(): void {
    // Placeholder until supplier creation flow exists.
    console.log('Criar novo fornecedor');
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();
    const filtered = this.allRows.filter((row) => {
      const matchesSearch = !query || this.matchesSearch(row, query);
      const matchesCity = this.cityFilter === 'ALL' || row.city === this.cityFilter;
      return matchesSearch && matchesCity;
    });

    this.dataSource.data = this.applySort(filtered);
  }

  clearFilters(): void {
    this.searchText = '';
    this.cityFilter = 'ALL';
    this.sortBy = 'NAME_ASC';
    this.applyFilters();
  }

  setCityFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.cityFilter = next || 'ALL';
  }

  setSortBy(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.sortBy = (next as 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC') || 'NAME_ASC';
  }

  private matchesSearch(row: SupplierListRow, query: string): boolean {
    return (
      row.name.toLowerCase().includes(query) ||
      row.vatNumber.toLowerCase().includes(query) ||
      row.explorationCode.toLowerCase().includes(query) ||
      row.phone.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query)
    );
  }

  private applySort(rows: SupplierListRow[]): SupplierListRow[] {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      if (this.sortBy === 'NAME_ASC') {
        return a.name.localeCompare(b.name, 'pt');
      }
      if (this.sortBy === 'NAME_DESC') {
        return b.name.localeCompare(a.name, 'pt');
      }
      if (this.sortBy === 'CREATED_DESC') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sorted;
  }
}
