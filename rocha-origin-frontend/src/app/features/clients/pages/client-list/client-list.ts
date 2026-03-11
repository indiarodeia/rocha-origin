import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_CLIENTS } from '../../../../core/mocks/client.mock';
import { Client } from '../../../../core/models/client.model';
import {
  ListFilterOption,
  ListFiltersComponent,
} from '../../../../shared/components/list-filters/list-filters.component';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface ClientListRow {
  id: string;
  companyName: string;
  vatNumber: string;
  phone: string;
  city: string;
  paymentTypeLabel: string;
  paymentTypeKey: Client['defaultPaymentType'] | null;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ListFiltersComponent, ...MATERIAL_MODULES],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
})
export class ClientList {
  searchText = '';
  cityFilter = 'ALL';
  paymentTypeFilter: 'ALL' | NonNullable<Client['defaultPaymentType']> = 'ALL';
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC' = 'NAME_ASC';

  readonly cityOptions: string[];
  readonly paymentTypeOptions: ListFilterOption[] = [
    { value: 'IMMEDIATE', label: 'Pronto pagamento' },
    { value: 'CREDIT', label: 'Credito' },
    { value: 'CUSTOMER', label: 'Conta cliente' },
  ];
  readonly sortOptions: ListFilterOption[] = [
    { value: 'NAME_ASC', label: 'Nome A-Z', icon: 'sort_by_alpha' },
    { value: 'NAME_DESC', label: 'Nome Z-A', icon: 'sort_by_alpha' },
    { value: 'CREATED_DESC', label: 'Mais recentes', icon: 'schedule' },
    { value: 'CREATED_ASC', label: 'Mais antigos', icon: 'history' },
  ];

  readonly displayedColumns = [
    'companyName',
    'vatNumber',
    'phone',
    'city',
    'paymentType',
  ];

  private readonly allRows: ClientListRow[] = MOCK_CLIENTS.map((client) => ({
      id: client.id,
      companyName: client.companyName,
      vatNumber: client.vatNumber,
      phone: client.phone,
      email: client.email ?? '',
      city: client.billingCity ?? '-',
      paymentTypeLabel: this.paymentLabel(client.defaultPaymentType),
      paymentTypeKey: client.defaultPaymentType ?? null,
      createdAt: client.createdAt,
    }));

  readonly dataSource = new MatTableDataSource<ClientListRow>([]);

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

  paymentLabel(paymentType: Client['defaultPaymentType']): string {
    const labels = {
      IMMEDIATE: 'Pronto pagamento',
      CREDIT: 'Credito',
      CUSTOMER: 'Conta cliente',
    };

    return paymentType ? labels[paymentType] : '-';
  }

  onAddClient(): void {
    // Placeholder until client creation flow exists.
    console.log('Criar novo cliente');
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();
    const filtered = this.allRows.filter((row) => {
      const matchesSearch = !query || this.matchesSearch(row, query);
      const matchesCity = this.cityFilter === 'ALL' || row.city === this.cityFilter;
      const matchesPayment =
        this.paymentTypeFilter === 'ALL' || row.paymentTypeKey === this.paymentTypeFilter;

      return matchesSearch && matchesCity && matchesPayment;
    });

    this.dataSource.data = this.applySort(filtered);
  }

  clearFilters(): void {
    this.searchText = '';
    this.cityFilter = 'ALL';
    this.paymentTypeFilter = 'ALL';
    this.sortBy = 'NAME_ASC';
    this.applyFilters();
  }

  setCityFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.cityFilter = next || 'ALL';
  }

  setPaymentTypeFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.paymentTypeFilter = (next as 'ALL' | NonNullable<Client['defaultPaymentType']>) || 'ALL';
  }

  setSortBy(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.sortBy = (next as 'NAME_ASC' | 'NAME_DESC' | 'CREATED_DESC' | 'CREATED_ASC') || 'NAME_ASC';
  }

  private matchesSearch(row: ClientListRow, query: string): boolean {
    return (
      row.companyName.toLowerCase().includes(query) ||
      row.vatNumber.toLowerCase().includes(query) ||
      row.phone.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query)
    );
  }

  private applySort(rows: ClientListRow[]): ClientListRow[] {
    const sorted = [...rows];

    sorted.sort((a, b) => {
      if (this.sortBy === 'NAME_ASC') {
        return a.companyName.localeCompare(b.companyName, 'pt');
      }
      if (this.sortBy === 'NAME_DESC') {
        return b.companyName.localeCompare(a.companyName, 'pt');
      }
      if (this.sortBy === 'CREATED_DESC') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sorted;
  }
}
