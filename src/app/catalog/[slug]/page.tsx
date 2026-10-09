import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory, products } from "@/data/catalog";
import { ModelExplorer } from "@/components/ModelExplorer";
import { ProductVisual } from "@/components/ProductVisual";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return { title: category?.title ?? "Каталог" };
}

export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const items = products.filter((product) => product.categorySlug === category.slug);
  const isMetal = category.direction === "metal";

  return <>
    <section className={`category-hero category-hero-immersive ${category.image ? "has-photo" : "has-graphic"}`}>
      {category.image ? <Image className="category-hero-background" src={category.image} alt="" fill priority sizes="100vw" /> : <div className="category-hero-graphic" aria-hidden="true"><ProductVisual variant={isMetal ? "structure" : category.slug.includes("mach") ? "mast" : "pole"} /></div>}
      <div className="category-hero-shade" aria-hidden="true" />
      <div className="container category-hero-inner">
        <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><span>{category.title}</span></div>
        <div className="category-hero-main">
          <span className="category-hero-label">{isMetal ? "Металлоконструкции" : "Опоры и освещение"}</span>
          <h1>{category.slug === "metallokonstruktsii" ? <>Металло<wbr />конструкции</> : category.title}</h1>
          <div className="category-hero-bottom"><p>{category.note}. Если готовой серии нет в списке, отправьте чертёж или параметры.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-primary">Запросить расчёт <span aria-hidden>↗</span></Link></div>
        </div>
      </div>
    </section>
    <div className="container category-content">
      {items.length ? <><div className="section-heading"><div><span className="eyebrow">СЕРИИ И МОДЕЛИ</span><h2>Найдите нужное обозначение</h2></div><p>Выберите серию в списке или найдите её по обозначению.</p></div><ModelExplorer items={items} /></> : <><div className="section-heading"><div><span className="eyebrow">ПОДБОР ПОД ПРОЕКТ</span><h2>Расскажите о задаче</h2></div><p>Укажите изделие и параметры для расчёта.</p></div><div className="category-placeholder"><ProductVisual variant={isMetal ? "structure" : "pole"} /><div><strong>Нужного изделия пока нет в каталоге?</strong><p>Укажите изделие, количество и регион поставки. Если есть чертёж или спецификация, приложите их к запросу.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-dark">Отправить запрос <span aria-hidden>↗</span></Link></div></div></>}
    </div>
  </>;
}
