import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { RouteApiService } from '../api/services/route-api.service';
import {
  RouteUpsertInput,
  mapApiRouteToUiRoute,
  mapRouteToSaveRouteRequest,
} from '../api/mappers/route.mapper';
import { Route } from '../models/route.model';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  constructor(private readonly routeApiService: RouteApiService) {}

  getAll(): Observable<Route[]> {
    return this.routeApiService.getAll().pipe(
      map((routes) => routes.map(mapApiRouteToUiRoute)),
      map((routes) => this.sortRoutes(routes)),
    );
  }

  getActive(): Observable<Route[]> {
    return this.getAll().pipe(map((routes) => routes.filter((route) => route.isActive)));
  }

  getById(apiId: string): Observable<Route> {
    return this.routeApiService.getById(apiId).pipe(map(mapApiRouteToUiRoute));
  }

  create(payload: RouteUpsertInput): Observable<Route> {
    return this.routeApiService.create(mapRouteToSaveRouteRequest(payload)).pipe(map(mapApiRouteToUiRoute));
  }

  update(apiId: string, payload: RouteUpsertInput): Observable<Route> {
    return this.routeApiService
      .update(apiId, mapRouteToSaveRouteRequest(payload))
      .pipe(map(mapApiRouteToUiRoute));
  }

  setAsInactive(apiId: string): Observable<Route> {
    return this.routeApiService.setAsInactive(apiId).pipe(map(mapApiRouteToUiRoute));
  }

  private sortRoutes(routes: Route[]): Route[] {
    return [...routes].sort((left, right) => {
      const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.name.localeCompare(right.name, 'pt');
    });
  }
}
