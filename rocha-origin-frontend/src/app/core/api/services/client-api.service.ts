import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Client, SaveClientRequest, SearchClientsRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ClientApiService extends BaseApiService {
  private readonly clientsPath = 'Clients';

  create(payload: SaveClientRequest): Observable<Client> {
    return this.http.post<Client>(this.buildUrl(this.clientsPath), payload);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(this.buildUrl(`${this.clientsPath}/${id}`));
  }

  update(id: string, payload: SaveClientRequest): Observable<Client> {
    return this.http.put<Client>(this.buildUrl(`${this.clientsPath}/${id}`), payload);
  }

  searchAndFilter(payload: SearchClientsRequest): Observable<Client[]> {
    return this.http.post<Client[]>(this.buildUrl(`${this.clientsPath}/search-and-filter`), payload);
  }

  countSearchAndFilter(payload: SearchClientsRequest): Observable<number> {
    return this.http.post<number>(this.buildUrl(`${this.clientsPath}/search-and-filter/count`), payload);
  }

  setAsInactive(id: string): Observable<Client> {
    return this.http.patch<Client>(this.buildUrl(`${this.clientsPath}/${id}/set-as-inactive`), {});
  }
}
