"use client";

import { useId, useState } from "react";
import type { Product } from "@/data/catalog";

export function ProductDetails({ product }: { product: Pick<Product, "description" | "descriptionBlocks" | "specifications"> }) {
  const specs = product.specifications ?? [];
  const paragraphs = product.descriptionBlocks?.length ? product.descriptionBlocks : product.description ? [product.description] : [];
  const [tab, setTab] = useState(specs.length ? "specifications" : "description");
  const id = useId();
  const tabs = [...(specs.length ? [{ key: "specifications", label: "Характеристики" }] : []), ...(paragraphs.length ? [{ key: "description", label: "Описание" }] : [])];
  if (!tabs.length) return null;
  return <section className="product-information"><h2>О товаре</h2><div className="product-detail-tabs" role="tablist" aria-label="Информация об изделии">{tabs.map((item, index) => <button key={item.key} type="button" role="tab" id={`${id}-${item.key}`} aria-selected={tab === item.key} aria-controls={`${id}-${item.key}-panel`} tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={(event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].key); document.getElementById(`${id}-${tabs[next].key}`)?.focus();
  }}>{item.label}</button>)}</div>
    {specs.length > 0 && <div role="tabpanel" id={`${id}-specifications-panel`} aria-labelledby={`${id}-specifications`} hidden={tab !== "specifications"}><dl className="product-specifications">{specs.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div>}
    {paragraphs.length > 0 && <div role="tabpanel" id={`${id}-description-panel`} aria-labelledby={`${id}-description`} hidden={tab !== "description"} className="product-description">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
  </section>;
}
