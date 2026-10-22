type ProductImageSource = {
  id: string;
  imageUrl?: string | null;
};

export function getProductImageUrl({ id, imageUrl }: ProductImageSource): string {
  const savedUrl = imageUrl?.trim();
  if (savedUrl) {
    return savedUrl;
  }

  return `https://picsum.photos/seed/neocart-${encodeURIComponent(id)}/800/800`;
}
