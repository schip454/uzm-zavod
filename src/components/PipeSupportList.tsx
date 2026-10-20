import Link from "next/link";
import type { Product } from "@/data/catalog";
import { ArrowIcon } from "./ArrowIcon";

export function PipeSupportList({ items }: { items: Product[] }) {
  const types = items.filter((item) => item.slug.startsWith("pipe-support-"));
  const series = items.filter((item) => !item.slug.startsWith("pipe-support-"));
  return <div className="pipe-support-list">
    <section><h2>Типы опор трубопроводов</h2><ul>{types.map((item) => <li key={item.slug}><Link href={`/product/${item.slug}/`}><span>{item.name}</span><ArrowIcon /></Link></li>)}</ul></section>
    <section><h2>Серии и стандарты</h2><p>Выберите серию, чтобы посмотреть исполнения и характеристики.</p><ul>{series.map((item) => <li key={item.slug}><Link href={`/product/${item.slug}/`}><span>{item.name}</span><ArrowIcon /></Link></li>)}</ul></section>
  </div>;
}
