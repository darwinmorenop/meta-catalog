export interface ProductAttributes {
    product_id: number;
    created_at: Date;
    updated_at: Date;
    // Filtros
    olfactory_family?: string; // Solo perfumes
    skin_type?: string[];      // Tratamiento (puede ser para varios tipos)
    gender: 'male' | 'female' | 'unisex'; // Type en supabase

    // Especificaciones
    format: string;            // Spray, Serum, etc.
    size: number;
    unit: 'ml' | 'gr'; // Type en supabase

    // Ética y Claims (Booleans)
    claims: {
        is_vegan: boolean;
        is_cruelty_free: boolean;
        is_refillable: boolean;
    };

    // Legal
    inci: string;   // Ingredientes
    pao: string;    // "12M", "24M"

    // Notas de perfume (JSON en Supabase)
    notes?: {
        top: string[];           // Notas de salida
        heart: string[];         // Notas de corazón
        base: string[];          // Notas de fondo
    };
}