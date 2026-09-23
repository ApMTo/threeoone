export type ProductSectionItem = {
  id: string;
  name: string;
  price: string;
  imageSrc: string;
  href: string;
};

const productImages = ["/product1.png", "/product2.png", "/product3.png", "/product1.png"] as const;

function createMockProducts(prefix: string, slug: string): ProductSectionItem[] {
  return productImages.map((imageSrc, index) => ({
    id: `${prefix}-${index + 1}`,
    name: "Eagles of Armenia T-Shirt",
    price: "$159.00",
    imageSrc,
    href: `/products/${slug}-${index + 1}`,
  }));
}

export const newInProducts = createMockProducts("new-in", "eagles-of-armenia-t-shirt");
export const essentialsProducts = createMockProducts("essentials", "essentials-t-shirt");
export const bestsellersProducts = createMockProducts("bestsellers", "bestsellers-t-shirt");
