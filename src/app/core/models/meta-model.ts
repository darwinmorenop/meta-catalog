export interface MetaProduct {
  id: string;
  title: string;
  description: string;
  availability: 'in stock' | 'out of stock' | string;
  condition: 'new' | 'used' | string;
  price: string; // Formato: "10,00 USD"
  link: string;
  image_link: string;
  brand: string;
  google_product_category: string;
  fb_product_category: string;
  quantity_to_sell_on_facebook: number | string;
  sale_price?: string;
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

  // Índice de firma para permitir campos extra dinámicos si el  cambia
  [key: string]: any;
}
