export interface SearchAnimalsRequest {
  search?: string | null;
  species?: string | null;
  supplierId?: string | null;
  isSortAscending: boolean;
  sortBy?: string | null;
  pageNumber: number;
  pageSize: number;
}
