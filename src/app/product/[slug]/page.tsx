import { ArrowIcon } from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getCategoryTrail, getCategoryProducts, getProduct, products } from "@/data/catalog";
import { ProductImage } from "@/components/ProductImage";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product ? `${product.name} — ${product.family}` : "Изделие", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = getCategory(product.categorySlug);
  const related = getCategoryProducts(product.categorySlug).filter((item) => item.slug !== product.slug).slice(0, 3);

  return <div className="container product-page">
    <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link>{getCategoryTrail(product.categorySlug).map((item) => <span className="breadcrumb-part" key={item.slug}><span>/</span><Link href={`/catalog/${item.slug}`}>{item.title}</Link></span>)}<span>/</span><span>{product.name}</span></div>
    <div className="product-layout">
      <div className={`product-art ${product.image ? "has-product-photo" : ""}`}><ProductImage product={product} priority /></div>
      <div className="product-info"><span className="eyebrow">{product.family}</span><h1>{product.name}</h1><p className="product-lead">{product.description ?? `Серия ${product.name}. Подберём исполнение и комплектацию по параметрам вашего проекта.`}</p><div className="product-keyfacts"><div><span>Назначение</span><strong>{product.purpose}</strong></div><div><span>Исполнение</span><strong>{product.form}</strong></div><div><span>Стоимость</span><strong>По запросу</strong></div></div><Link href={`/request?product=${encodeURIComponent(`${product.name} — ${product.family}`)}`} className="button button-primary">Запросить расчёт <ArrowIcon /></Link><p className="product-caveat">Укажите количество и регион поставки. Чертёж или спецификация помогут подготовить точный расчёт.</p></div>
    </div>
    {product.specifications && <section className="product-details"><h2>Характеристики</h2><dl className="detail-list">{product.specifications.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>}
    <section className="category-selection"><div><h2>Подберём исполнение</h2><p>{category?.application ?? "Отправьте параметры изделия или приложите рабочую документацию."}</p></div><ul>{(category?.selection ?? ["Размеры", "Количество", "Регион поставки", "Чертёж или спецификация"]).map((item) => <li key={item}>{item}</li>)}</ul></section>
    {related.length > 0 && <section className="related-products"><h2>В этой группе</h2><div className="model-grid">{related.map((item) => <Link href={`/product/${item.slug}`} className="model-card" key={item.slug}><div className="model-card-visual"><ProductImage product={item} /></div><div className="model-card-body"><strong>{item.name}</strong><div>Подробнее <ArrowIcon /></div></div></Link>)}</div></section>}
    <div className="product-next"><div><strong>Нужна другая модель?</strong><p>Вернитесь к списку серий или отправьте требования к изделию.</p></div><Link href={`/catalog/${product.categorySlug}`} className="button button-dark">Все модели <ArrowIcon direction="right" /></Link></div>
  </div>;
}
