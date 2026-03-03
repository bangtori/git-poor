export {
  type ApiResponse,
  type ApiSuccess,
  type ApiError,
} from '@/lib/http/response';

import { PaginationMeta } from './page-info';
import { GroupSummary } from './group';
import { InvitationWithGroup } from './invitation';

export interface GroupApiResponse {
  data: GroupSummary[];
  meta: PaginationMeta;
}

export interface InvitationApiResponse {
  data: InvitationWithGroup[];
  meta: PaginationMeta;
}
