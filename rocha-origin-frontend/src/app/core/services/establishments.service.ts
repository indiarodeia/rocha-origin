import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  EstablishmentUpsertInput,
  mapApiEstablishmentToUiEstablishment,
  mapEstablishmentToSaveRequest,
} from '../api/mappers/establishment.mapper';
import { EstablishmentApiService } from '../api/services/establishment-api.service';
import { Establishment } from '../models/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentsService {
  constructor(private readonly establishmentApiService: EstablishmentApiService) {}

  getAll(): Observable<Establishment[]> {
    return this.establishmentApiService
      .getAll()
      .pipe(map((items) => items.map(mapApiEstablishmentToUiEstablishment)));
  }

  getByClient(clientId: string): Observable<Establishment[]> {
    return this.establishmentApiService
      .getByClient(clientId)
      .pipe(map((items) => items.map(mapApiEstablishmentToUiEstablishment)));
  }

  getByRoute(routeId: string): Observable<Establishment[]> {
    return this.establishmentApiService
      .getByRoute(routeId)
      .pipe(map((items) => items.map(mapApiEstablishmentToUiEstablishment)));
  }

  getById(id: string): Observable<Establishment> {
    return this.establishmentApiService.getById(id).pipe(map(mapApiEstablishmentToUiEstablishment));
  }

  create(payload: EstablishmentUpsertInput): Observable<Establishment> {
    return this.establishmentApiService
      .create(mapEstablishmentToSaveRequest(payload))
      .pipe(map(mapApiEstablishmentToUiEstablishment));
  }

  update(id: string, payload: EstablishmentUpsertInput): Observable<Establishment> {
    return this.establishmentApiService
      .update(id, mapEstablishmentToSaveRequest(payload))
      .pipe(map(mapApiEstablishmentToUiEstablishment));
  }

  setAsInactive(id: string): Observable<Establishment> {
    return this.establishmentApiService
      .setAsInactive(id)
      .pipe(map(mapApiEstablishmentToUiEstablishment));
  }
}
