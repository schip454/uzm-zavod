import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProduct, products } from "@/data/catalog";
import { ProductVisual } from "@/components/ProductVisual";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product ? `${product.name} — ${product.family}` : "Изделие" };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = getCategory(product.categorySlug);

  return <div className="container product-page">
    <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link><span>/</span><Link href={`/catalog/${product.categorySlug}`}>{category?.title}</Link><span>/</span><span>{product.name}</span></div>
    <div className="product-layout">
      <div className="product-art"><span>СХЕМА ИЗДЕЛИЯ / ВИЗУАЛ ДЛЯ ПРОТОТИПА</span><ProductVisual variant={product.form === "Мачта" ? "mast" : "pole"} /></div>
      <div className="product-info"><span className="eyebrow">{product.family.toUpperCase()}</span><h1>{product.name}</h1><p className="product-lead">Серия из каталога опор освещения. Параметры, варианты исполнения и наличие уточняются по технической документации УЗМ.</p><div className="product-keyfacts"><div><span>Назначение</span><strong>{product.purpose}</strong></div><div><span>Форма</span><strong>{product.form}</strong></div><div><span>Исполнение</span><strong>По спецификации</strong></div></div><Link href={`/request?product=${encodeURIComponent(product.name)}`} className="button button-primary">Запросить расчёт <span aria-hidden>↗</span></Link><p className="product-caveat">Карточка наполняется: размеры, нагрузки, покрытие и чертежи появятся после проверки исходных данных.</p></div>
    </div>
    <section className="product-details"><div><span className="eyebrow">ПАРАМЕТРЫ</span><h2>Что укажем в окончательной карточке</h2></div><div className="detail-list"><div><span>Геометрия и размеры</span><strong>По подтверждённой таблице вариантов</strong></div><div><span>Материал и покрытие</span><strong>По технической спецификации</strong></div><div><span>Чертёж и документы</span><strong>После проверки заказчиком</strong></div><div><span>Цена</span><strong>По запросу</strong></div></div></section>
    <div className="product-next"><div><strong>Нужна другая модель?</strong><p>Вернитесь к списку серий или отправьте требования к изделию.</p></div><Link href={`/catalog/${product.categorySlug}`} className="button button-dark">Все модели <span aria-hidden>→</span></Link></div>
  </div>;
}
