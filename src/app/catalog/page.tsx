import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExplorer } from "@/components/CatalogExplorer";

export const metadata: Metadata = { title: "Каталог продукции" };

export default function CatalogPage() {
  return (
    <div className="page-shell container">
      <div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Каталог</span></div>
      <div className="page-title-row"><div><span className="eyebrow">НОМЕНКЛАТУРА УЗМ</span><h1>Каталог продукции</h1></div><p>Выберите направление или найдите группу по названию. Опоры освещения собраны по назначению, форме и серии.</p></div>
      <CatalogExplorer />
      <div className="catalog-bottom-note"><div><strong>Не нашли изделие?</strong><p>Нестандартную конструкцию можно рассчитать по чертежу.</p></div><Link href="/request" className="button button-dark">Отправить чертёж <span aria-hidden>↗</span></Link></div>
    </div>
  );
}
