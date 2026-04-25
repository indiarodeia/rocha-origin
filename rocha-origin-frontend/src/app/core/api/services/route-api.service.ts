import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '../base-api.service';
import { Route, SaveRouteRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RouteApiService extends BaseApiService {
  private readonly routesPath = 'Routes';

  getAll(): Observable<Route[]> {
    return this.http.get<Route[]>(this.buildUrl(this.routesPath));
  }

  getById(id: string): Observable<Route> {
    return this.http.get<Route>(this.buildUrl(`${this.routesPath}/${id}`));
  }

  create(payload: SaveRouteRequest): Observable<Route> {
    return this.http.post<Route>(this.buildUrl(this.routesPath), payload);
  }

  update(id: string, payload: SaveRouteRequest): Observable<Route> {
    return this.http.put<Route>(this.buildUrl(`${this.routesPath}/${id}`), payload);
  }

  setAsInactive(id: string): Observable<Route> {
    return this.http.patch<Route>(this.buildUrl(`${this.routesPath}/${id}/set-as-inactive`), {});
  }
}
