export interface SearchSuppliersRequest {
  search?: string | null;
  city?: string | null;
  isSortAscending: boolean;
  sortBy?: string | null;
  pageNumber: number;
  pageSize: number;
}
