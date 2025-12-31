export interface Brand {
  id: number; // Cambiado de string a number para concordar con bigint  created_at: Date;
  updated_at: Date;
  name: string;
  brand_code: string;
  description: string;
}