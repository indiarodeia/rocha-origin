import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  LotUpsertInput,
  mapApiLotToUiLot,
  mapLotToSaveRequest,
} from '../api/mappers/lot.mapper';
import { LotApiService } from '../api/services/lot-api.service';
import { Lot } from '../models/lot.model';

@Injectable({
  providedIn: 'root',
})
export class LotsService {
  constructor(private readonly lotApiService: LotApiService) {}

  getAll(): Observable<Lot[]> {
    return this.lotApiService.getAll().pipe(map((lots) => lots.map(mapApiLotToUiLot)));
  }

  getById(id: string): Observable<Lot> {
    return this.lotApiService.getById(id).pipe(map(mapApiLotToUiLot));
  }

  create(input: LotUpsertInput): Observable<Lot> {
    return this.lotApiService.create(mapLotToSaveRequest(input)).pipe(map(mapApiLotToUiLot));
  }

  update(id: string, input: LotUpsertInput): Observable<Lot> {
    return this.lotApiService.update(id, mapLotToSaveRequest(input)).pipe(map(mapApiLotToUiLot));
  }

  addAnimals(lotId: string, animalIds: string[]): Observable<Lot> {
    return this.lotApiService.addAnimals(lotId, animalIds).pipe(map(mapApiLotToUiLot));
  }

  removeAnimals(lotId: string, animalIds: string[]): Observable<Lot> {
    return this.lotApiService.removeAnimals(lotId, animalIds).pipe(map(mapApiLotToUiLot));
  }
}
