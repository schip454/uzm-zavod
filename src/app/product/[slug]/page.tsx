import { ArrowIcon } from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getCategoryTrail, getCategoryProducts, getProduct, getRetiredProduct, products, retiredProducts } from "@/data/catalog";
import { ProductImage } from "@/components/ProductImage";
import { VariantTable } from "@/components/VariantTable";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetails } from "@/components/ProductDetails";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return [...products, ...retiredProducts].map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product ? `${product.name} — ${product.family}` : "Изделие", description: product?.description };
}

export default async function ProductPage({ params }: Props) {
  const slug = (await params).slug;
  const product = getProduct(slug);
  const retired = getRetiredProduct(slug);
  if (!product && retired) {
    const target = `/catalog/${retired.categorySlug}/`;
    return <div className="container retired-product"><meta httpEquiv="refresh" content={`0;url=${target}`} /><h1>Каталог обновлён</h1><p>Перейдите к согласованным сериям и моделям.</p><Link className="button button-primary" href={target}>Открыть раздел <ArrowIcon /></Link></div>;
  }
  if (!product) notFound();
  const category = getCategory(product.categorySlug);
  const series = product.seriesSlug ? getProduct(product.seriesSlug) : undefined;
  const related = getCategoryProducts(product.categorySlug).filter((item) => item.slug !== product.slug).slice(0, 3);

  return <div className="container product-page">
    <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link>{getCategoryTrail(product.categorySlug).map((item) => <span className="breadcrumb-part" key={item.slug}><span>/</span><Link href={`/catalog/${item.slug}`}>{item.title}</Link></span>)}{series && <><span>/</span><Link href={`/product/${series.slug}`}>{series.name}</Link></>}<span>/</span><span>{product.name}</span></div>
    <div className="product-layout">
      <ProductGallery product={{ name: product.name, image: product.image, gallery: product.gallery }} />
      <div className="product-info"><span className="eyebrow">{product.family}</span><h1 className={product.categorySlug === "kronshteyny" ? "product-title-compact" : undefined}>{product.name}</h1><p className="product-lead">{product.description ?? `Серия ${product.name}. Подберём исполнение и комплектацию по параметрам вашего проекта.`}</p><div className="product-keyfacts"><div><span>Назначение</span><strong>{product.purpose}</strong></div><div><span>Исполнение</span><strong>{product.form}</strong></div><div><span>Стоимость</span><strong>По запросу</strong></div></div><Link href={`/request?product=${encodeURIComponent(`${product.name} — ${product.family}`)}`} className="button button-primary">Запросить расчёт <ArrowIcon /></Link><p className="product-caveat">Укажите количество и регион поставки. Чертёж или спецификация помогут подготовить точный расчёт.</p></div>
    </div>
    <ProductDetails product={{ description: product.description, descriptionBlocks: product.descriptionBlocks, specifications: product.specifications }} />
    {product.variantTable && <VariantTable name={product.name} table={product.variantTable} />}
    <section className="category-selection"><div><h2>Подберём исполнение</h2><p>{category?.application ?? "Отправьте параметры изделия или приложите рабочую документацию."}</p></div><ul>{(category?.selection ?? ["Размеры", "Количество", "Регион поставки", "Чертёж или спецификация"]).map((item) => <li key={item}>{item}</li>)}</ul></section>
    {related.length > 0 && <section className="related-products"><h2>В этой группе</h2><div className="model-grid">{related.map((item) => <Link href={`/product/${item.slug}`} className="model-card" key={item.slug}><div className="model-card-visual"><ProductImage product={item} /></div><div className="model-card-body"><strong>{item.name}</strong><div>Подробнее <ArrowIcon /></div></div></Link>)}</div></section>}
    <div className="product-next"><div><strong>Нужна другая модель?</strong><p>Вернитесь к списку серий или отправьте требования к изделию.</p></div><Link href={`/catalog/${product.categorySlug}`} className="button button-dark">Все модели <ArrowIcon direction="right" /></Link></div>
  </div>;
}
