export interface UserEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  externalAuthId?: string | null;
  email: string;
  phone: string | null;
  isManual: boolean;
  firstName: string;
  lastName?: string | null;
  rank: string;
  sponsorId: number | null; 
  path: string;
  image: string;
}