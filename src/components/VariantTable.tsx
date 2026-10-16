"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowIcon } from "./ArrowIcon";

type Table = { headers: string[]; rows: string[][] };
const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е");

export function VariantTable({ name, table }: { name: string; table: Table }) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => table.rows.filter((row) => normalize(row.join(" ")).includes(normalize(query.trim()))), [query, table.rows]);

  return <section className="product-variants">
    <div className="product-variants-heading"><h2>Исполнения</h2><p>Выберите обозначение для расчёта заказа.</p></div>
    <div className="variant-controls">
      <label className="catalog-search"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти обозначение или размер" aria-label={`Поиск исполнений серии ${name}`} /></label>
      <span aria-live="polite">Показано: {rows.length} из {table.rows.length}</span>
    </div>
    {rows.length ? <div className="product-table-scroll" tabIndex={0} role="region" aria-label={`Исполнения серии ${name}`}><table><caption className="sr-only">Исполнения серии {name}</caption><thead><tr>{table.headers.map((heading) => <th key={heading} scope="col">{heading}</th>)}<th scope="col"><span className="sr-only">Выбор исполнения</span></th></tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((value, column) => column === 0 ? <th key={column} scope="row">{value}</th> : <td key={column}>{value}</td>)}<td><Link href={`/request?product=${encodeURIComponent(row[0])}`} className="variant-select" aria-label={`Запросить расчёт: ${row[0]}`}>Выбрать<ArrowIcon /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state">Такого исполнения в таблице нет. <button type="button" className="variant-reset" onClick={() => setQuery("")}>Показать все</button></div>}
  </section>;
}
