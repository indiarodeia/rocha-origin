import { Route as UiRoute } from '../../models/route.model';
import { Route as ApiRoute, SaveRouteRequest } from '../models';

export interface RouteUpsertInput {
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
}

export function mapApiRouteToUiRoute(apiRoute: ApiRoute): UiRoute {
  return {
    id: buildRouteUiId(apiRoute.name),
    apiId: apiRoute.id,
    name: apiRoute.name,
    sortOrder: apiRoute.order ?? undefined,
    isActive: apiRoute.isActive,
  };
}

export function mapRouteToSaveRouteRequest(route: RouteUpsertInput): SaveRouteRequest {
  return {
    name: route.name.trim(),
    order: route.sortOrder ?? null,
    isActive: route.isActive,
  };
}

export function buildRouteUiId(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function buildRouteVisualClass(route: Pick<UiRoute, 'id' | 'name'>): string {
  const routeKey = route.id || buildRouteUiId(route.name);
  return `route-${routeKey.toLowerCase()}`;
}
