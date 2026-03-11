import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_ANIMALS } from '../../../../core/mocks/animal.mock';
import { MOCK_SUPPLIERS } from '../../../../core/mocks/supplier.mock';
import { Animal } from '../../../../core/models/animal.model';
import {
  ListFilterOption,
  ListFiltersComponent,
} from '../../../../shared/components/list-filters/list-filters.component';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface AnimalListRow {
  arrivalDate: string;
  animalIdentification: string;
  species: Animal['species'];
  supplierName: string;
  slaughterDate: string;
  breed: string;
  ageMonths: number | null;
  europRaw: string;
  coldWeightKg: number | null;
  purchasePriceTotal: number | null;
  purchasePricePerKg: number | null;
}

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ListFiltersComponent, ...MATERIAL_MODULES],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.scss',
})
export class AnimalList {
  searchText = '';
  speciesFilter: 'ALL' | Animal['species'] = 'ALL';
  supplierFilter = 'ALL';
  sortBy:
    | 'SLAUGHTER_DESC'
    | 'SLAUGHTER_ASC'
    | 'ARRIVAL_DESC'
    | 'ARRIVAL_ASC'
    | 'IDENT_ASC'
    | 'IDENT_DESC'
    | 'WEIGHT_DESC'
    | 'WEIGHT_ASC' = 'SLAUGHTER_DESC';

  readonly speciesOptions = ['BOVINO', 'OVINO'];
  readonly supplierOptions: ListFilterOption[];
  readonly sortOptions: ListFilterOption[] = [
    { value: 'SLAUGHTER_DESC', label: 'Abate: mais recente', icon: 'schedule' },
    { value: 'SLAUGHTER_ASC', label: 'Abate: mais antigo', icon: 'history' },
    { value: 'ARRIVAL_DESC', label: 'Entrada: mais recente', icon: 'schedule' },
    { value: 'ARRIVAL_ASC', label: 'Entrada: mais antiga', icon: 'history' },
    { value: 'IDENT_ASC', label: 'Identificação A-Z', icon: 'sort_by_alpha' },
    { value: 'IDENT_DESC', label: 'Identificação Z-A', icon: 'sort_by_alpha' },
    { value: 'WEIGHT_DESC', label: 'Peso: maior primeiro', icon: 'arrow_upward' },
    { value: 'WEIGHT_ASC', label: 'Peso: menor primeiro', icon: 'arrow_downward' },
  ];

  readonly displayedColumns = [
    'species',
    'arrivalDate',
    'animalIdentification',
    'supplierName',
    'slaughterDate',
    'breed',
    'ageMonths',
    'europRaw',
    'coldWeightKg',
    'purchasePriceTotal',
    'purchasePricePerKg',
  ];

  private readonly allRows: AnimalListRow[] = MOCK_ANIMALS.map((animal) => ({
      arrivalDate: animal.arrivalDate ?? '-',
      animalIdentification: animal.animalIdentification,
      species: animal.species,
      supplierName: this.resolveSupplierName(animal.supplierId),
      slaughterDate: animal.slaughterDate ?? '-',
      breed: animal.breed ?? '-',
      ageMonths: animal.ageMonths ?? null,
      europRaw: animal.europRaw ?? this.buildEurop(animal),
      coldWeightKg: animal.coldWeightKg ?? null,
      purchasePriceTotal: animal.purchasePriceTotal ?? null,
      purchasePricePerKg: animal.purchasePricePerKg ?? null,
    }));

  readonly dataSource = new MatTableDataSource<AnimalListRow>([]);

  constructor() {
    this.supplierOptions = Array.from(
      new Set(
        this.allRows
          .map((row) => row.supplierName)
          .filter((name) => name && name !== '-'),
      ),
    )
      .sort((a, b) => a.localeCompare(b, 'pt'))
      .map((name) => ({ value: name, label: name }));

    this.applyFilters();
  }

  speciesLabel(species: Animal['species']): string {
    return species === 'BOVINO' ? 'Bovino' : 'Ovino';
  }

  onAddAnimal(): void {
    // Placeholder until animal creation flow exists.
    console.log('Criar novo animal');
  }

  setSortBy(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.sortBy = (next as
      | 'SLAUGHTER_DESC'
      | 'SLAUGHTER_ASC'
      | 'ARRIVAL_DESC'
      | 'ARRIVAL_ASC'
      | 'IDENT_ASC'
      | 'IDENT_DESC'
      | 'WEIGHT_DESC'
      | 'WEIGHT_ASC') || 'SLAUGHTER_DESC';
  }

  setSpeciesFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.speciesFilter = (next as 'ALL' | Animal['species']) || 'ALL';
  }

  setSupplierFilter(value: string | string[]): void {
    const next = Array.isArray(value) ? value[0] : value;
    this.supplierFilter = next || 'ALL';
  }

  clearFilters(): void {
    this.searchText = '';
    this.speciesFilter = 'ALL';
    this.supplierFilter = 'ALL';
    this.sortBy = 'SLAUGHTER_DESC';
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchText.trim().toLowerCase();
    const filtered = this.allRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.animalIdentification.toLowerCase().includes(query) ||
        row.supplierName.toLowerCase().includes(query) ||
        row.breed.toLowerCase().includes(query) ||
        row.europRaw.toLowerCase().includes(query);

      const matchesSpecies =
        this.speciesFilter === 'ALL' || row.species === this.speciesFilter;

      const matchesSupplier =
        this.supplierFilter === 'ALL' || row.supplierName === this.supplierFilter;

      return matchesSearch && matchesSpecies && matchesSupplier;
    });

    this.dataSource.data = this.applySort(filtered);
  }

  private buildEurop(animal: Animal): string {
    if (!animal.europConformation || !animal.europFatClass || !animal.europCategory) {
      return '-';
    }

    return `${animal.europConformation}${animal.europFatClass}${animal.europCategory}`;
  }

  private resolveSupplierName(supplierId?: string): string {
    if (!supplierId) {
      return '-';
    }

    const supplier = MOCK_SUPPLIERS.find((item) => item.id === supplierId);
    return supplier?.name ?? supplierId;
  }

  private toSortableDate(value: string): number {
    if (!value || value === '-') {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private applySort(rows: AnimalListRow[]): AnimalListRow[] {
    const sorted = [...rows];
    sorted.sort((a, b) => this.compareRows(a, b));
    return sorted;
  }

  private compareRows(a: AnimalListRow, b: AnimalListRow): number {
    if (this.sortBy === 'IDENT_ASC') {
      return a.animalIdentification.localeCompare(b.animalIdentification, 'pt');
    }
    if (this.sortBy === 'IDENT_DESC') {
      return b.animalIdentification.localeCompare(a.animalIdentification, 'pt');
    }
    if (this.sortBy === 'ARRIVAL_ASC') {
      return this.toSortableDate(a.arrivalDate) - this.toSortableDate(b.arrivalDate);
    }
    if (this.sortBy === 'ARRIVAL_DESC') {
      return this.toSortableDate(b.arrivalDate) - this.toSortableDate(a.arrivalDate);
    }
    if (this.sortBy === 'WEIGHT_ASC') {
      return (a.coldWeightKg ?? 0) - (b.coldWeightKg ?? 0);
    }
    if (this.sortBy === 'WEIGHT_DESC') {
      return (b.coldWeightKg ?? 0) - (a.coldWeightKg ?? 0);
    }
    if (this.sortBy === 'SLAUGHTER_ASC') {
      return this.toSortableDate(a.slaughterDate) - this.toSortableDate(b.slaughterDate);
    }

    return this.toSortableDate(b.slaughterDate) - this.toSortableDate(a.slaughterDate);
  }
}
