import Image from "next/image";
import type { Product } from "@/data/catalog";

export function ProductImage({ product, priority = false }: { product: Pick<Product, "name" | "image">; priority?: boolean }) {
  return product.image
    ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 620px) 45vw, (max-width: 1180px) 30vw, 24vw" priority={priority} className="product-image" />
    : <div className="product-photo-pending" aria-label={product.name}><span>{product.name}</span></div>;
}
