import { ProductStatusEnum } from "src/app/core/models/products/product.status.enum";
import { UserProfileEntity } from "src/app/shared/entity/user.entity";

export interface UserAgendaDashboardEntity {
  owner_id: string;
  contact_id: string;
  alias: string | null;
  tags: string[] | null;
  lead: string[] | null;
  created_at: Date;
  updated_at: Date;
  agenda_notes: string | null;
  last_contact_at: Date | null;
  last_contact_result: string | null;
  last_contact_history_notes: string | null;
  last_follow_up_at: Date | null;
  last_follow_up_result: string | null;
  last_follow_up_history_notes: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile: UserProfileEntity | null;
  birthday: Date | null;
  image: string | null;
  user_status: ProductStatusEnum;
  user_general_notes: string | null;
  user_owner_id: string;
  is_manual: boolean;
}