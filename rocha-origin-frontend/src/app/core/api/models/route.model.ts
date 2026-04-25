export interface Route {
  id: string;
  name: string;
  order: number | null;
  isActive: boolean;
}

export interface SaveRouteRequest {
  name: string;
  order?: number | null;
  isActive: boolean;
}
