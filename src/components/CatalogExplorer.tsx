"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowIcon } from "@/components/ArrowIcon";
import type { Category, Direction } from "@/data/catalog";

type NavigationGroup = Pick<Category, "slug" | "title" | "direction" | "note" | "parentSlug"> & { productCount: number };
export type CatalogNavigationItem = NavigationGroup & { children: NavigationGroup[] };
const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

export function CatalogExplorer({ items }: { items: CatalogNavigationItem[] }) {
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => items.filter((category) => (query.trim() || !category.parentSlug) && (direction === "all" || category.direction === direction) && normalize(`${category.title} ${category.note}`).includes(normalize(query.trim()))), [direction, query, items]);

  return <>
    <div className="catalog-controls">
      <div className="segmented" role="group" aria-label="Направление">
        <button className={direction === "all" ? "selected" : ""} onClick={() => setDirection("all")}>Все группы</button>
        <button className={direction === "metal" ? "selected" : ""} onClick={() => setDirection("metal")}>Металлоконструкции</button>
        <button className={direction === "lighting" ? "selected" : ""} onClick={() => setDirection("lighting")}>Опоры освещения</button>
      </div>
      <label className="catalog-search"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти группу продукции" aria-label="Поиск по группам каталога" /></label>
    </div>
    {visible.length ? <div className="catalog-tree">{["metal", "lighting"].filter((group) => visible.some((item) => item.direction === group)).map((group) => <section key={group}>
      <h2>{group === "metal" ? "Металлоконструкции и изделия" : "Опоры и освещение"}</h2>
      <div className="catalog-list">{visible.filter((item) => item.direction === group).map((category) => <div className="catalog-tree-item" key={category.slug}>
        <Link href={`/catalog/${category.slug}`} className="catalog-list-item"><span><strong>{category.title}</strong><small>{category.note}</small></span><ArrowIcon className="catalog-list-arrow" /></Link>
        {category.children.length > 0 && !query.trim() && <div className="catalog-tree-children">{category.children.map((child) => <Link key={child.slug} href={`/catalog/${child.slug}`}>{child.title}<span>{child.productCount || "По проекту"}</span></Link>)}</div>}
      </div>)}</div>
    </section>)}</div> : <div className="empty-state">По этому запросу групп не найдено. Попробуйте другое название или <Link href="/request">отправьте задачу</Link>.</div>}
  </>;
}
