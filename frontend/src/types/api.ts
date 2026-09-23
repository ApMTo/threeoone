export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
