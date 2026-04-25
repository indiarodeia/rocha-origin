import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { Animal } from '../../../../core/models/animal.model';
import { Species } from '../../../../core/models/types.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';
import { AnimalsService } from '../../services/animal.service';

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
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.scss',
})
export class AnimalList {
  searchText = '';
  speciesFilter: 'ALL' | Species = 'ALL';
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

  pageIndex = 0;
  readonly pageSize = 20;
  totalCount = 0;
  isLoading = true;
  hasError = false;
  isEmpty = false;
  errorMessage = '';
  emptyMessage = 'Não existem animais para os filtros aplicados.';
  listReady = false;

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

  readonly dataSource = new MatTableDataSource<AnimalListRow>([]);

  constructor(
    private readonly animalsService: AnimalsService,
    private readonly snackBar: MatSnackBar,
  ) {
    afterNextRender(() => {
      this.listReady = true;
      this.loadAnimals();
    });
  }

  speciesLabel(species: Animal['species']): string {
    return species === 'OVINO' ? 'Ovino' : 'Bovino';
  }

  onAddAnimal(): void {
    this.snackBar.open('Criação de animais em breve disponível.', 'Fechar', { duration: 2800 });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.loadAnimals();
  }

  private loadAnimals(): void {
    this.isLoading = true;
    this.hasError = false;
    this.isEmpty = false;
    this.errorMessage = '';
    this.dataSource.data = [];

    const supplierId = this.supplierFilter !== 'ALL' ? this.supplierFilter : null;
    const species = this.speciesFilter !== 'ALL' ? this.speciesFilter : null;

    this.animalsService
      .search({
        searchText: this.searchText,
        species,
        supplierId,
        sortBy: this.sortBy,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: ({ items, totalCount }) => {
          this.isLoading = false;
          this.totalCount = totalCount;
          const rows = items.map((animal) => ({
            arrivalDate: animal.arrivalDate ?? '-',
            animalIdentification: animal.animalIdentification,
            species: animal.species,
            supplierName: animal.supplierId ?? '-',
            slaughterDate: animal.slaughterDate ?? '-',
            breed: animal.breed ?? '-',
            ageMonths: animal.ageMonths ?? null,
            europRaw: animal.europRaw ?? '-',
            coldWeightKg: animal.coldWeightKg ?? null,
            purchasePriceTotal: animal.purchasePriceTotal ?? null,
            purchasePricePerKg: animal.purchasePricePerKg ?? null,
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
          this.errorMessage = 'Não foi possível carregar os animais. Tente novamente.';
        },
      });
  }

}
