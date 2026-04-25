import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Establishment, SaveEstablishmentRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentApiService extends BaseApiService {
  private readonly establishmentsPath = 'Establishments';

  getAll(): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(this.buildUrl(this.establishmentsPath));
  }

  getByClient(clientId: string): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(
      this.buildUrl(`${this.establishmentsPath}/by-client/${clientId}`),
    );
  }

  getByRoute(routeId: string): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(
      this.buildUrl(`${this.establishmentsPath}/by-route/${routeId}`),
    );
  }

  getById(id: string): Observable<Establishment> {
    return this.http.get<Establishment>(this.buildUrl(`${this.establishmentsPath}/${id}`));
  }

  create(payload: SaveEstablishmentRequest): Observable<Establishment> {
    return this.http.post<Establishment>(this.buildUrl(this.establishmentsPath), payload);
  }

  update(id: string, payload: SaveEstablishmentRequest): Observable<Establishment> {
    return this.http.put<Establishment>(this.buildUrl(`${this.establishmentsPath}/${id}`), payload);
  }

  setAsInactive(id: string): Observable<Establishment> {
    return this.http.patch<Establishment>(
      this.buildUrl(`${this.establishmentsPath}/${id}/set-as-inactive`),
      {},
    );
  }
}
