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
    <div className="category-hero"><div className="container"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><span>{category.title}</span></div><div className="category-hero-grid"><div><span className="eyebrow">{isMetal ? "МЕТАЛЛОКОНСТРУКЦИИ" : "КАТАЛОГ ОПОР"}</span><h1>{category.title}</h1><p>{category.note}. Если готовой серии нет в списке, отправьте чертёж или параметры — подготовим расчёт.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-primary">Запросить расчёт <span aria-hidden>↗</span></Link></div><div className="category-hero-art">{category.image ? <Image src={category.image} alt="" fill sizes="(max-width: 800px) 100vw, 45vw" /> : <ProductVisual variant={category.slug.includes("mach") ? "mast" : "pole"} />}</div></div></div></div>
    <div className="container category-content">
      {items.length ? <><div className="section-heading"><div><span className="eyebrow">СЕРИИ И МОДЕЛИ</span><h2>Найдите нужное обозначение</h2></div><p>Сейчас показана первая выборка. Реестр характеристик и доступность изделий сверяем с заказчиком перед публикацией.</p></div><ModelExplorer items={items} /></> : <><div className="section-heading"><div><span className="eyebrow">ПОДБОР ПОД ПРОЕКТ</span><h2>Расскажите о задаче</h2></div><p>Группа включена в структуру каталога. Карточки и технические данные наполняются после сверки реестра.</p></div><div className="category-placeholder"><ProductVisual variant={isMetal ? "structure" : "pole"} /><div><strong>Для этой группы готовим номенклатуру</strong><p>Укажите изделие, количество и регион поставки. Если есть чертёж или спецификация, приложите их к запросу.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-dark">Отправить запрос <span aria-hidden>↗</span></Link></div></div></>}
    </div>
  </>;
}
