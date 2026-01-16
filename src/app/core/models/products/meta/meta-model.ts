export interface MetaProduct {
  id: string;
  title: string;
  description: string;
  availability: 'in stock' | 'out of stock' | string;
  condition: 'new' | 'used' | string;
  price: number; // Formato: "10,00 USD"
  link: string;
  image_link: string;
  brand: string;
  google_product_category: string;
  fb_product_category: string;
  quantity_to_sell_on_facebook: number | string;
  sale_price?: number;
  sale_price_effective_date?: string;
  item_group_id?: string;
  gender?: string;
  color?: string;
  size?: string;
  age_group?: string;
  material?: string;
  pattern?: string;
  shipping?: string;
  shipping_weight?: string;
  // Campos con nombres especiales en el  se mapean como strings literales
  'video[0].url'?: string;
  'video[0].tag[0]'?: string;
  gtin?: string;
  'product_tags[0]'?: string;
  'product_tags[1]'?: string;
  'style[0]'?: string;
  remoteCode?: string;
  additional_image_link?: string;
  productCommercialCode: string;
  summary?: string;
  status: 'active' | 'archived' | string;

  // Índice de firma para permitir campos extra dinámicos si el  cambia
  [key: string]: any;
}

export interface ChangeRecord {
  type: 'UPDATE' | 'NEW';
  product: MetaProduct;
  changes?: { field: string, oldValue: any, newValue: any }[];
}

export const META_DEFAULTS = {
  MANDATORY: 'UNKNOWN'
};

export const META_PRODUCT_HEADERS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'brand',
  'google_product_category',
  'fb_product_category',
  'quantity_to_sell_on_facebook',
  'sale_price',
  'sale_price_effective_date',
  'item_group_id',
  'gender',
  'color',
  'size',
  'age_group',
  'material',
  'pattern',
  'shipping',
  'shipping_weight',
  'video[0].url',
  'video[0].tag[0]',
  'gtin',
  'product_tags[0]',
  'product_tags[1]',
  'style[0]',
  'additional_image_link',
  'remoteCode',
  'productCommercialCode',
  'summary',
  'status'
];

export const MANDATORY_FIELDS = [
  'id',
  'title',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'brand',
  'productCommercialCode'
];

export function sanitizeMetaProduct(product: Partial<MetaProduct>): MetaProduct {
  return {
    ...product,
    // Mandatory fields with fallback
    id: product.id || META_DEFAULTS.MANDATORY,
    title: product.title || META_DEFAULTS.MANDATORY,
    availability: product.availability || META_DEFAULTS.MANDATORY,
    condition: product.condition || META_DEFAULTS.MANDATORY,
    price: product.price || META_DEFAULTS.MANDATORY,
    sale_price: product.sale_price || META_DEFAULTS.MANDATORY,
    link: product.link || META_DEFAULTS.MANDATORY,
    image_link: product.image_link || META_DEFAULTS.MANDATORY,
    brand: product.brand || META_DEFAULTS.MANDATORY,
    productCommercialCode: product.productCommercialCode || META_DEFAULTS.MANDATORY,
    remoteCode: product.remoteCode || META_DEFAULTS.MANDATORY,
    // Ensure other fields are at least present if needed, or keep optional
    description: product.description || "",
    summary: product.summary || "",
    additional_image_link: product.additional_image_link || "",
  } as MetaProduct;
}
