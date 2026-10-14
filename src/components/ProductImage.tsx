import Image from "next/image";
import { ProductVisual } from "./ProductVisual";
import type { Product } from "@/data/catalog";

export function ProductImage({ product, priority = false }: { product: Product; priority?: boolean }) {
  return product.image
    ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 620px) 45vw, (max-width: 1180px) 30vw, 24vw" priority={priority} className={`product-image${product.image.startsWith("/images/generated/") || product.image.startsWith("/images/uzm-") ? " is-generated" : ""}`} />
    : <ProductVisual variant={product.visual ?? (product.form === "Мачта" ? "mast" : "pole")} />;
}
