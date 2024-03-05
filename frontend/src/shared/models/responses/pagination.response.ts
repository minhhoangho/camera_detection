export type PaginationDataResponse = {
  data: Record<string, any>[],
  pagination: PaginationMeta
};


export type PaginationMeta = {
  total: number;
  limit: number;
  offset: number;
};
