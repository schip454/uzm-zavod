import { ArrowIcon } from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { categories, getCategoryProducts, getChildren, type Category } from "@/data/catalog";

export const metadata: Metadata = { title: "Каталог продукции" };

export default function CatalogPage() {
  const summary = ({ slug, title, direction, note, parentSlug }: Category) => ({ slug, title, direction, note, parentSlug, productCount: getCategoryProducts(slug).length });
  const navigation = categories.map((category) => ({ ...summary(category), children: getChildren(category.slug).map(summary) }));
  return (
    <div className="page-shell catalog-page container">
      <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Каталог</span></div>
      <div className="page-title-row"><div><span className="eyebrow">НОМЕНКЛАТУРА УЗМ</span><h1>Каталог продукции</h1></div><div className="catalog-intro-side"><div className="catalog-intro-photo"><Image src="/images/uzm-trusses.jpg" alt="Стальные фермы" fill priority sizes="(max-width: 900px) 100vw, 40vw" /></div><p>Выберите направление или найдите группу по названию. Опоры освещения собраны по назначению, форме и серии.</p></div></div>
      <CatalogExplorer items={navigation} />
      <div className="catalog-bottom-note"><div><strong>Не нашли изделие?</strong><p>Нестандартную конструкцию можно рассчитать по чертежу.</p></div><Link href="/request" className="button button-dark">Отправить чертёж <ArrowIcon /></Link></div>
    </div>
  );
}
