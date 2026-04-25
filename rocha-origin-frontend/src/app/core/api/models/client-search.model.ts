export interface SearchClientsRequest {
  search?: string | null;
  city?: string | null;
  paymentTypeId?: number | null;
  isSortAscending: boolean;
  sortBy?: string | null;
  pageNumber: number;
  pageSize: number;
}
