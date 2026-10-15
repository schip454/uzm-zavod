import { ArrowIcon } from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory, getCategoryProducts, getCategoryTrail, getChildren } from "@/data/catalog";
import { CategoryGroups } from "@/components/CategoryGroups";
import { ModelExplorer } from "@/components/ModelExplorer";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return { title: category?.title ?? "Каталог", description: category?.description ?? category?.note };
}

export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const children = getChildren(category.slug);
  const items = getCategoryProducts(category.slug);
  const isMetal = category.direction === "metal";

  return <>
    <section className={`category-hero category-hero-immersive ${category.image ? "has-photo" : "has-graphic"}`}>
      {category.image && <Image className="category-hero-background" src={category.image} alt="" fill priority sizes="100vw" />}
      <div className="category-hero-shade" aria-hidden="true" />
      <div className="container category-hero-inner">
        <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><Link href="/catalog">Каталог</Link>{getCategoryTrail(category.slug).map((item) => <span className="breadcrumb-part" key={item.slug}><span>/</span>{item.slug === category.slug ? <span>{item.title}</span> : <Link href={`/catalog/${item.slug}`}>{item.title}</Link>}</span>)}</div>
        <div className="category-hero-main">
          <span className="category-hero-label">{isMetal ? "Металлоконструкции" : "Опоры и освещение"}</span>
          <h1>{category.slug === "metallokonstruktsii" ? <>Металло<wbr />конструкции</> : category.title}</h1>
          <div className="category-hero-bottom"><p>{category.note}. Подберём исполнение по вашему проекту.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-primary">Запросить расчёт <ArrowIcon /></Link></div>
        </div>
      </div>
    </section>
    <div className="container category-content">
      {category.description && <div className="category-introduction"><h2>{category.title}</h2><div><p>{category.description}</p>{category.application && <p className="category-application">{category.application}</p>}</div></div>}
      {children.length > 0 && <section className="category-subgroups"><h2>Выберите группу</h2><CategoryGroups items={children} /></section>}
      {items.length > 0 && category.slug !== "opory-osveshcheniya" && <><div className="section-heading"><div><h2>{isMetal ? "Изделия" : "Серии и модели"}</h2></div><p>Найдите название или выберите группу изделий.</p></div><ModelExplorer key={category.slug} items={items} /></>}
      <section className="category-selection"><div><h2>Что нужно для расчёта</h2><p>Пришлите спецификацию или заполните заявку. Если проект ещё готовится, укажите известные параметры.</p><Link href={`/request?product=${encodeURIComponent(category.title)}`} className="button button-primary">Получить расчёт <ArrowIcon /></Link></div><ul>{(category.selection ?? ["Название изделия", "Основные размеры", "Количество", "Регион поставки", "Чертёж или техническое задание"]).map((item) => <li key={item}>{item}</li>)}</ul></section>
    </div>
  </>;
}
