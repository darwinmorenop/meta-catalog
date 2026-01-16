export enum UserRankEnum {
  unknown = 'Desconocido',
  clienta = 'Clienta',
  style_advisor = 'Style Advisor',
  emprendedora = 'Emprendedora',
  emprendedora_senior = 'Emprendedora Senior',
  directora_aspirante = 'Directora Aspirante',
  directora_junior = 'Directora Junior',
  directora_senior = 'Directora Senior',
  directora_senior_super = 'Directora Senior Super',
  directora_regional = 'Directora Regional',
  directora_regional_estella = 'Directora Regional Estella',
  directora_master = 'Directora Master',
  admin = 'Administrador'

}

export interface UserDashboardModel {
  id: number;
  email: string | null;
  phone: string | null;
  isManual: boolean;
  firstName: string;
  lastName?: string | null;
  rank: UserRankEnum;
  sponsor: UserDashboardModel | null;
  image: string | null;
}

export interface UserCreateModel {
  email: string | null;
  phone: string | null;
  isManual: boolean;
  firstName: string;
  lastName?: string | null;
  rank: UserRankEnum;
  sponsorId: number | null;
  image: string | null;
}

export interface UserUpdateModel extends Omit<UserCreateModel, 'sponsorId'> {
  id: number;
}