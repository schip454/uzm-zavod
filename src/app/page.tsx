import Link from "next/link";
import { ShowcaseHero } from "@/components/ShowcaseHero";
import { QuoteForm } from "@/components/QuoteForm";
import "./home.css";

const featured = [
  { title: "Опоры освещения", detail: "Силовые и несиловые", href: "/catalog/opory-osveshcheniya" },
  { title: "Мачты освещения", detail: "Для площадок и объектов", href: "/catalog/machty-osveshcheniya" },
  { title: "Закладные детали", detail: "Фундаменты и крепления", href: "/catalog/zakladnye-detali" },
  { title: "Кронштейны", detail: "Для светильников", href: "/catalog/kronshteyny" },
];

export default function Home() {
  return (
    <div className="showcase-page">
      <ShowcaseHero />

      <section className="showcase-statement" id="directions">
        <div className="container showcase-statement-grid">
          <span className="showcase-section-index">01 / ПРОИЗВОДСТВО</span>
          <div>
            <h2>Каркас по чертежу.<br /><em>Опора</em> по каталогу.</h2>
            <div className="showcase-statement-foot">
              <p>Два направления — один завод. Изготавливаем конструкции по проекту и выпускаем изделия для освещения и инфраструктуры.</p>
              <Link href="/request" className="showcase-text-link">Обсудить задачу <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-directions container" aria-label="Направления производства">
        <Link className="showcase-direction showcase-direction-primary" href="/catalog/metallokonstruktsii">
          <span className="showcase-direction-number">01 / ОСНОВНОЕ НАПРАВЛЕНИЕ</span>
          <span className="showcase-direction-copy"><strong>Металло<span>конструкции</span></strong><small>Каркасы, фермы, колонны, балки и изделия по вашим чертежам.</small></span>
          <span className="showcase-direction-arrow" aria-hidden="true">↗</span>
        </Link>
        <Link className="showcase-direction showcase-direction-secondary" href="/catalog/opory-osveshcheniya">
          <span className="showcase-direction-number">02 / ВТОРОЕ НАПРАВЛЕНИЕ</span>
          <span className="showcase-direction-copy"><strong>Опоры<br />освещения</strong><small>Опоры, мачты и комплектующие для городских и промышленных объектов.</small></span>
          <span className="showcase-direction-arrow" aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className="showcase-gallery" id="production">
        <div className="container showcase-gallery-heading">
          <div><span className="showcase-section-index">02 / В МАТЕРИАЛЕ</span><h2>Сталь в цехе.<br /><em>Сталь на объекте.</em></h2></div>
          <p>Каркасы зданий, готовые фермы и обработка листового металла.</p>
        </div>
        <div className="container showcase-gallery-grid">
          <figure className="showcase-shot showcase-shot-large"><div className="showcase-shot-image showcase-shot-frame" /><figcaption><span>01</span><strong>Каркас здания</strong><span>Металлоконструкции</span></figcaption></figure>
          <figure className="showcase-shot showcase-shot-offset"><div className="showcase-shot-image showcase-shot-truss" /><figcaption><span>02</span><strong>Стальные фермы</strong><span>Изделия</span></figcaption></figure>
          <div className="showcase-gallery-quote"><span>УЗМ / ЕКАТЕРИНБУРГ</span><p>Отдельная ферма. Целый каркас<span>.</span></p></div>
          <figure className="showcase-shot showcase-shot-process"><div className="showcase-shot-image showcase-shot-forming" /><figcaption><span>03</span><strong>Работа с металлом</strong><span>Производство</span></figcaption></figure>
        </div>
      </section>

      <section className="showcase-assortment">
        <div className="container">
          <div className="showcase-assortment-head"><div><span className="showcase-section-index">03 / КАТАЛОГ</span><h2>Изделие под<br />ваш проект.</h2></div><Link className="showcase-text-link" href="/catalog">Весь каталог <span aria-hidden="true">↗</span></Link></div>
          <div className="showcase-assortment-list">{featured.map((item, index) => <Link href={item.href} key={item.href}><span>0{index + 1}</span><strong>{item.title}</strong><small>{item.detail}</small><b aria-hidden="true">↗</b></Link>)}</div>
          <p className="showcase-assortment-note">Не нашли нужную модель? Отправьте обозначение или чертёж — сверим параметры и рассчитаем изготовление.</p>
        </div>
      </section>

      <section className="showcase-request" id="request">
        <div className="container showcase-request-layout">
          <div className="showcase-request-heading"><span className="showcase-section-index">04 / НАЧНЁМ С ВАШЕЙ ЗАДАЧИ</span><h2>Покажите,<br />что нужно<br /><em>изготовить.</em></h2><p>Пришлите название изделия, количество и регион. Если есть чертёж или спецификация, приложите файл.</p><span className="showcase-request-mark" aria-hidden="true">↗</span></div>
          <div className="showcase-request-form"><h3>Запросить расчёт</h3><QuoteForm /></div>
        </div>
      </section>
    </div>
  );
}
