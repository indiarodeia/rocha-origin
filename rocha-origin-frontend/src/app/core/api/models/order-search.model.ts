export interface SearchAndFilterOrdersRequestDto {
  search?: string | null;
  statusIds?: number[] | null;
  routeIds?: string[] | null;
  deliveryTypeId?: number | null;
  hideDelivered: boolean;
  isSortAscending: boolean;
  pageNumber: number;
  pageSize: number;
}
