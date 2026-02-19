import { GroupSummary } from './group';
import { PaginationMeta } from './page-info';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

export type GroupListResponse = ApiResponse<GroupSummary[]>;
