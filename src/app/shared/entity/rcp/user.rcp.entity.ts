import { UserRankEnum } from "src/app/core/models/users/user.model";
import { UserSettingsEntity } from "src/app/shared/entity/user.entity";

export interface UserSponsorEntity {
  id: number;
  fullName: string;
  email: string;
  rank: UserRankEnum;
  isEligible: boolean;
  reason: string | null;
}

export interface UserNode extends UserNetworkDetail {
  children?: UserNode[];
}

export interface UserNetworkDetail {
  id: number;
  identifier: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  rank: UserRankEnum;
  image: string | null;
  isManual: boolean;
  pathStr: string;
  relativeLevel: number;
  user_profile_id: string;
  user_profile_name: string;
  settings: UserSettingsEntity;

  // Detalles del Sponsor desglosados
  sponsorId: number | null;
  sponsorFirstName: string | null;
  sponsorLastName: string | null;
  sponsorFullName: string | null;
  sponsorEmail: string | null;
  sponsorPhone: string | null;
  sponsorRank: UserRankEnum | null;
  sponsorImage: string | null;
  sponsorIdentifier: string | null;
}