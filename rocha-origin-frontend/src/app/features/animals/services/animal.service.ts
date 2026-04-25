import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import {
  AnimalUpsertInput,
  mapAnimalToSaveRequest,
  mapApiAnimalToUiAnimal,
} from '../../../core/api/mappers/animal.mapper';
import { AnimalApiService } from '../../../core/api/services/animal-api.service';
import { Animal } from '../../../core/models/animal.model';
import { Species } from '../../../core/models/types.model';

export interface AnimalsQuery {
  searchText: string;
  species: Species | null;
  supplierId: string | null;
  sortBy:
    | 'SLAUGHTER_DESC'
    | 'SLAUGHTER_ASC'
    | 'ARRIVAL_DESC'
    | 'ARRIVAL_ASC'
    | 'IDENT_ASC'
    | 'IDENT_DESC'
    | 'WEIGHT_DESC'
    | 'WEIGHT_ASC';
  pageIndex: number;
  pageSize: number;
}

export interface AnimalsSearchResult {
  items: Animal[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnimalsService {
  constructor(private readonly animalApiService: AnimalApiService) {}

  search(query: AnimalsQuery): Observable<AnimalsSearchResult> {
    const payload = this.toSearchPayload(query);

    return forkJoin({
      items: this.animalApiService.searchAndFilter(payload),
      totalCount: this.animalApiService.countSearchAndFilter(payload).pipe(catchError(() => of(0))),
    }).pipe(
      map(({ items, totalCount }) => ({
        items: items.map(mapApiAnimalToUiAnimal),
        totalCount,
      })),
    );
  }

  getById(id: string): Observable<Animal> {
    return this.animalApiService.getById(id).pipe(map(mapApiAnimalToUiAnimal));
  }

  create(input: AnimalUpsertInput): Observable<Animal> {
    return this.animalApiService
      .create(mapAnimalToSaveRequest(input))
      .pipe(map(mapApiAnimalToUiAnimal));
  }

  update(id: string, input: AnimalUpsertInput): Observable<Animal> {
    return this.animalApiService
      .update(id, mapAnimalToSaveRequest(input))
      .pipe(map(mapApiAnimalToUiAnimal));
  }

  setAsInactive(id: string): Observable<Animal> {
    return this.animalApiService.setAsInactive(id).pipe(map(mapApiAnimalToUiAnimal));
  }

  private toSearchPayload(query: AnimalsQuery) {
    const sortMap = {
      SLAUGHTER_DESC: { sortBy: 'slaughterDate', isSortAscending: false },
      SLAUGHTER_ASC: { sortBy: 'slaughterDate', isSortAscending: true },
      ARRIVAL_DESC: { sortBy: 'arrivalDate', isSortAscending: false },
      ARRIVAL_ASC: { sortBy: 'arrivalDate', isSortAscending: true },
      IDENT_ASC: { sortBy: 'animalIdentification', isSortAscending: true },
      IDENT_DESC: { sortBy: 'animalIdentification', isSortAscending: false },
      WEIGHT_DESC: { sortBy: 'coldWeightKg', isSortAscending: false },
      WEIGHT_ASC: { sortBy: 'coldWeightKg', isSortAscending: true },
    } as const;

    const sort = sortMap[query.sortBy];

    return {
      search: query.searchText.trim() || null,
      species: query.species,
      supplierId: query.supplierId,
      sortBy: sort.sortBy,
      isSortAscending: sort.isSortAscending,
      pageNumber: query.pageIndex + 1,
      pageSize: query.pageSize,
    };
  }
}
