export interface UserEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  externalAuthId?: string | null;
  email: string;
  phone: string | null;
  isManual: boolean;
  identifier: string;
  firstName: string;
  lastName?: string | null;
  rank: string;
  sponsorId: number | null; 
  path: string;
  image: string;
  user_profile_id: string;
  settings: UserSettingsEntity;
}

export interface UserSettingsEntity {
  theme: 'light' | 'dark';
}