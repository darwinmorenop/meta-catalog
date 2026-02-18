export interface UserEntity {
  id: string;
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
  sponsorId: string | null; 
  path: string;
  image: string;
  profile: UserProfileEntity;
  birthday: string | null;
  status: string;
  notes: string | null;
  user_owner_id: string;
  user_profile_id: string;
  settings: UserSettingsEntity;
}

export interface UserSettingsEntity {
  theme: 'light' | 'dark';
}

export interface UserProfileEntity {
 olfative: string[] | null;
 skin: string[] | null;   
}