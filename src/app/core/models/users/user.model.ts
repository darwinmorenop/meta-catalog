import { UserSettingsEntity } from "src/app/shared/entity/user.entity";

export enum UserRankEnum {
  unknown = 'unknown',
  clienta = 'clienta',
  style_advisor = 'style_advisor',
  emprendedora = 'emprendedora',
  emprendedora_senior = 'emprendedora_senior',
  directora_aspirante = 'directora_aspirante',
  directora_junior = 'directora_junior',
  directora_senior = 'directora_senior',
  directora_senior_super = 'directora_senior_super',
  directora_regional = 'directora_regional',
  directora_regional_estella = 'directora_regional_estella',
  directora_master = 'directora_master',
  admin = 'admin'
}

export const UserRankLabel: Record<UserRankEnum, string> = {
  [UserRankEnum.unknown]: 'Desconocido',
  [UserRankEnum.clienta]: 'Clienta',
  [UserRankEnum.style_advisor]: 'Style Advisor',
  [UserRankEnum.emprendedora]: 'Emprendedora',
  [UserRankEnum.emprendedora_senior]: 'Emprendedora Senior',
  [UserRankEnum.directora_aspirante]: 'Directora Aspirante',
  [UserRankEnum.directora_junior]: 'Directora Junior',
  [UserRankEnum.directora_senior]: 'Directora Senior',
  [UserRankEnum.directora_senior_super]: 'Directora Senior Super',
  [UserRankEnum.directora_regional]: 'Directora Regional',
  [UserRankEnum.directora_regional_estella]: 'Directora Regional Estella',
  [UserRankEnum.directora_master]: 'Directora Master',
  [UserRankEnum.admin]: 'Administrador'
}

export interface UserDashboardModel {
  id: number;
  email: string | null;
  phone: string | null;
  isManual: boolean;
  identifier: string;
  firstName: string;
  lastName?: string | null;
  rank: UserRankEnum;
  sponsor: UserDashboardModel | null;
  image: string | null;
  user_profile_id: string;
  settings: UserSettingsEntity;
}

export interface UserCreateModel {
  email: string | null;
  phone: string | null;
  identifier: string;
  isManual: boolean;
  firstName: string;
  lastName?: string | null;
  rank: UserRankEnum;
  sponsorId: number | null;
  image: string | null;
  user_profile_id: string;
  settings: UserSettingsEntity;
}

export interface UserUpdateModel extends Omit<UserCreateModel, 'sponsorId'> {
  id: number;
}