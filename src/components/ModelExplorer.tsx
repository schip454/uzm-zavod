"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/catalog";
import { ProductVisual } from "@/components/ProductVisual";

export function ModelExplorer({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");
  const [purpose, setPurpose] = useState("Все");
  const options = ["Все", ...new Set(items.map((item) => item.purpose))];
  const visible = useMemo(() => items.filter((item) => (purpose === "Все" || item.purpose === purpose) && `${item.name} ${item.family}`.toLowerCase().includes(query.trim().toLowerCase())), [items, purpose, query]);

  return <>
    <div className="model-controls"><div className="chip-row" role="group" aria-label="Тип опоры">{options.map((option) => <button key={option} className={purpose === option ? "active" : ""} onClick={() => setPurpose(option)}>{option}</button>)}</div><label className="catalog-search"><span aria-hidden>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по серии" aria-label="Поиск по моделям" /></label></div>
    {visible.length ? <div className="model-grid">{visible.map((item) => <Link href={`/product/${item.slug}`} className="model-card" key={item.slug}><div className="model-card-visual"><ProductVisual variant={item.form === "Мачта" ? "mast" : "pole"} /></div><div className="model-card-body"><span>{item.family}</span><strong>{item.name}</strong><div>Открыть карточку <b aria-hidden>↗</b></div></div></Link>)}</div> : <div className="empty-state">Моделей по такому запросу нет. <button onClick={() => { setQuery(""); setPurpose("Все"); }}>Сбросить поиск</button></div>}
  </>;
}
