"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, type Direction } from "@/data/catalog";

export function CatalogExplorer() {
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => categories.filter((category) => (direction === "all" || category.direction === direction) && `${category.title} ${category.note}`.toLowerCase().includes(query.trim().toLowerCase())), [direction, query]);

  return (
    <>
      <div className="catalog-controls">
        <div className="segmented" role="group" aria-label="Направление">
          <button className={direction === "all" ? "selected" : ""} onClick={() => setDirection("all")}>Все группы</button>
          <button className={direction === "metal" ? "selected" : ""} onClick={() => setDirection("metal")}>Металлоконструкции</button>
          <button className={direction === "lighting" ? "selected" : ""} onClick={() => setDirection("lighting")}>Опоры освещения</button>
        </div>
        <label className="catalog-search"><span aria-hidden>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти группу продукции" aria-label="Поиск по группам каталога" /></label>
      </div>
      {visible.length ? <div className="catalog-list">{visible.map((category, index) => <Link href={`/catalog/${category.slug}`} className="catalog-list-item" key={category.slug}><span className="catalog-list-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{category.title}</strong><small>{category.note}</small></span><span className="catalog-list-arrow" aria-hidden>↗</span></Link>)}</div> : <div className="empty-state">По этому запросу групп не найдено. Попробуйте другое название или <Link href="/request">отправьте задачу</Link>.</div>}
    </>
  );
}
