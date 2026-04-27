import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import {
  AddAnimalsToLotRequest,
  Lot,
  RemoveAnimalsFromLotRequest,
  SaveLotRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class LotApiService extends BaseApiService {
  private readonly lotsPath = 'Lots';

  getAll(): Observable<Lot[]> {
    return this.http.get<Lot[]>(this.buildUrl(this.lotsPath));
  }

  getById(id: string): Observable<Lot> {
    return this.http.get<Lot>(this.buildUrl(`${this.lotsPath}/${id}`));
  }

  create(payload: SaveLotRequest): Observable<Lot> {
    return this.http.post<Lot>(this.buildUrl(this.lotsPath), payload);
  }

  update(id: string, payload: SaveLotRequest): Observable<Lot> {
    return this.http.put<Lot>(this.buildUrl(`${this.lotsPath}/${id}`), payload);
  }

  addAnimals(lotId: string, animalIds: string[]): Observable<Lot> {
    const payload: AddAnimalsToLotRequest = { animalIds };
    return this.http.post<Lot>(this.buildUrl(`${this.lotsPath}/${lotId}/animals`), payload);
  }

  removeAnimals(lotId: string, animalIds: string[]): Observable<Lot> {
    const payload: RemoveAnimalsFromLotRequest = { animalIds };
    return this.http.delete<Lot>(this.buildUrl(`${this.lotsPath}/${lotId}/animals`), {
      body: payload,
    });
  }
}
