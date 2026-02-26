export {
  type ApiResponse,
  type ApiSuccess,
  type ApiError,
} from '@/lib/http/reponse';

import { PaginationMeta } from './page-info';
import { GroupSummary } from './group';

export interface GroupApiResponse {
  data: GroupSummary[];
  meta: PaginationMeta;
}
