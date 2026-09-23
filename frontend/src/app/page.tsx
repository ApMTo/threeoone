import { BrandStorySection } from "@/components/home/brand-story-section";
import { Hero } from "@/components/home/hero";
import { ImageBanner } from "@/components/home/image-banner";
import { ProductSection } from "@/components/products/product-section";
import {
  bestsellersProducts,
  essentialsProducts,
  newInProducts,
} from "@/data/mock-products";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-11.5 pb-11.5">
      <Hero />
      <ProductSection title="New In" products={newInProducts} />
      <ImageBanner src="/section1.png" alt="" width={394} height={369} />
      <ProductSection title="Essentials" products={essentialsProducts} />
      <ImageBanner src="/section2.png" alt="" width={390} height={606} />
      <ProductSection title="Bestsellers" products={bestsellersProducts} />
      <BrandStorySection />
    </div>
  );
}
