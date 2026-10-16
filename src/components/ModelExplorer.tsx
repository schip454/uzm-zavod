"use client";

import { ArrowIcon } from "@/components/ArrowIcon";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/catalog";
import { ProductImage } from "@/components/ProductImage";

export type ModelSummary = Pick<Product, "slug" | "name" | "family" | "form" | "image">;

export function ModelExplorer({ items }: { items: ModelSummary[] }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("Все");
  const options = ["Все", ...new Set(items.map((item) => item.family))];
  const visible = useMemo(() => items.filter((item) => (family === "Все" || item.family === family) && `${item.name} ${item.family} ${item.form}`.toLocaleLowerCase("ru").replaceAll("ё", "е").includes(query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е"))), [items, family, query]);
  const groups = [...new Set(visible.map((item) => item.family))];

  return <>
    <div className="model-controls">{options.length > 2 && <div className="chip-row" role="group" aria-label="Группа изделий">{options.map((option) => <button key={option} type="button" aria-pressed={family === option} className={family === option ? "active" : ""} onClick={() => setFamily(option)}>{option}</button>)}</div>}<label className="catalog-search"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или серия" aria-label="Поиск по моделям" /></label></div>
    <p className="result-count" role="status">Найдено изделий: {visible.length}</p>
    {visible.length ? groups.map((group) => <section className="model-family" key={group}><h3>{group}</h3><div className="model-grid">{visible.filter((item) => item.family === group).map((item) => <Link href={`/product/${item.slug}`} className="model-card" key={item.slug}><div className="model-card-visual"><ProductImage product={item} /></div><div className="model-card-body"><span>{item.form}</span><strong>{item.name}</strong><div>Подробнее <ArrowIcon /></div></div></Link>)}</div></section>) : <div className="empty-state">Изделий по такому запросу нет. <button type="button" onClick={() => { setQuery(""); setFamily("Все"); }}>Сбросить поиск</button></div>}
  </>;
}
