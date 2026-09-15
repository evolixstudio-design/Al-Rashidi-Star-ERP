export interface TemporaryCatalogueProduct {
  id: string;
  imageObjUrl: string;
  name: string;
  articleNo?: string;
  wholesalePrice?: number;
  size?: string;
  colour?: string;
  quality?: string;
}

export function chunkProducts(products: TemporaryCatalogueProduct[], size: number): TemporaryCatalogueProduct[][] {
  const result: TemporaryCatalogueProduct[][] = [];
  for (let i = 0; i < products.length; i += size) {
    result.push(products.slice(i, i + size));
  }
  return result;
}

export function revokeProductImageUrls(products: TemporaryCatalogueProduct[]) {
  products.forEach((p) => {
    if (p.imageObjUrl) {
      URL.revokeObjectURL(p.imageObjUrl);
    }
  });
}
