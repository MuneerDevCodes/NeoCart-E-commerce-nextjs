export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  rating: number;
  stock: number;
  featured: boolean;
  imageUrl: string;
  image_url: string;
  image_source_url: string;
  image_credit: string;
  fileId?: string;
  createdAt: number;
};
