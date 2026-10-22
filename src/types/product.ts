export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  rating: number;
  stock: number;
  featured: boolean;
  imageUrl: string;
  fileId?: string;
  createdAt: number;
};
