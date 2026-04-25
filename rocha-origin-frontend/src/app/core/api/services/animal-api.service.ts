import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Animal, SaveAnimalRequest, SearchAnimalsRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AnimalApiService extends BaseApiService {
  private readonly animalsPath = 'Animals';

  getAll(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.buildUrl(this.animalsPath));
  }

  getById(id: string): Observable<Animal> {
    return this.http.get<Animal>(this.buildUrl(`${this.animalsPath}/${id}`));
  }

  create(payload: SaveAnimalRequest): Observable<Animal> {
    return this.http.post<Animal>(this.buildUrl(this.animalsPath), payload);
  }

  update(id: string, payload: SaveAnimalRequest): Observable<Animal> {
    return this.http.put<Animal>(this.buildUrl(`${this.animalsPath}/${id}`), payload);
  }

  searchAndFilter(payload: SearchAnimalsRequest): Observable<Animal[]> {
    return this.http.post<Animal[]>(
      this.buildUrl(`${this.animalsPath}/search-and-filter`),
      payload,
    );
  }

  countSearchAndFilter(payload: SearchAnimalsRequest): Observable<number> {
    return this.http.post<number>(
      this.buildUrl(`${this.animalsPath}/search-and-filter/count`),
      payload,
    );
  }

  setAsInactive(id: string): Observable<Animal> {
    return this.http.patch<Animal>(
      this.buildUrl(`${this.animalsPath}/${id}/set-as-inactive`),
      {},
    );
  }
}
