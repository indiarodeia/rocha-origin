import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MOCK_ANIMALS } from '../../../../core/mocks/animal.mock';
import { Animal } from '../../../../core/models/animal.model';
import { ListPageComponent } from '../../../../shared/components/list-page/list-page.component';
import { MATERIAL_MODULES } from '../../../../shared/material/material.module';

interface AnimalListRow {
  id: string;
  species: Animal['species'];
  animalIdentification: string;
  breed: string;
  arrivalDate: string;
  coldWeightKg: number;
  europ: string;
  pricePerKg: number;
}

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, ListPageComponent, ...MATERIAL_MODULES],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.scss',
})
export class AnimalList {
  readonly displayedColumns = [
    'id',
    'species',
    'animalIdentification',
    'breed',
    'arrivalDate',
    'coldWeightKg',
    'europ',
    'pricePerKg',
  ];

  readonly dataSource = new MatTableDataSource<AnimalListRow>(
    MOCK_ANIMALS.map((animal) => ({
      id: animal.id,
      species: animal.species,
      animalIdentification: animal.animalIdentification,
      breed: animal.breed ?? '-',
      arrivalDate: animal.arrivalDate ?? '-',
      coldWeightKg: animal.coldWeightKg ?? 0,
      europ: animal.europRaw ?? this.buildEurop(animal),
      pricePerKg: animal.purchasePricePerKg ?? 0,
    })),
  );

  speciesLabel(species: Animal['species']): string {
    return species === 'BOVINO' ? 'Bovino' : 'Ovino';
  }

  onAddAnimal(): void {
    // Placeholder until animal creation flow exists.
    console.log('Criar novo animal');
  }

  private buildEurop(animal: Animal): string {
    if (!animal.europConformation || !animal.europFatClass || !animal.europCategory) {
      return '-';
    }

    return `${animal.europConformation}${animal.europFatClass}${animal.europCategory}`;
  }
}
