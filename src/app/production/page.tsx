import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowIcon } from "@/components/ArrowIcon";
import { CategoryGroups } from "@/components/CategoryGroups";
import { getCategory } from "@/data/catalog";

export const metadata: Metadata = { title: "Производство металлоконструкций", description: "Уральский завод металлоизделий в Екатеринбурге. Изготовление строительных и технологических конструкций по проектной документации." };
export default function ProductionPage() {
  const items = ["metallokonstruktsii", "tekhnologicheskie-metallokonstruktsii", "metalloobrabotka"].map((slug) => getCategory(slug)!);
  return <div className="container editorial-page"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Производство</span></div><div className="editorial-intro"><h1>Металл<br/>в работе</h1><p>Уральский завод металлоизделий в Екатеринбурге. Изготавливаем конструкции для строительства и промышленности по чертежам заказчика.</p></div><div className="production-feature"><Image src="/images/uzm-forming.jpg" alt="Гибка металла на производстве УЗМ" fill priority sizes="100vw"/></div><CategoryGroups items={items}/><section className="production-steps"><div><h2>Расчёт по документации</h2><p>Отправьте чертежи КМ или КМД, ведомость металла и требования к покрытию. Уточним состав заказа и подготовим расчёт.</p></div><div><h2>Изготовление</h2><p>Резка, гибка и сварка деталей и узлов. Геометрия, материалы и требования к обработке определяются документацией проекта.</p></div><div><h2>Подготовка к поставке</h2><p>Комплектацию, маркировку, упаковку и регион отгрузки согласуем при оформлении заказа.</p></div></section><section className="category-selection"><div><h2>Обсудим ваш проект</h2><p>Пришлите документацию или опишите задачу. Для первого расчёта нужны изделие, объём и регион поставки.</p></div><div><Link href="/request" className="button button-primary">Отправить чертёж <ArrowIcon/></Link></div></section></div>;
}
