export interface SearchProductsRequest {
  search: string | null;
  categoryId: number | null;
  sortBy: string | null;
  isSortAscending: boolean;
  pageNumber: number;
  pageSize: number;
}
