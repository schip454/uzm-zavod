import Link from "next/link";
import { categories, products } from "@/data/catalog";

const catalogGroups = categories.filter((category) =>
  ["opory-osveshcheniya", "machty-osveshcheniya", "zakladnye-detali", "kronshteyny", "parkovye-opory", "svetofornye-opory"].includes(category.slug),
);

export default function Home() {
  return (
    <>
      <section className="new-hero">
        <div className="new-hero-photo" aria-hidden="true" />
        <div className="container new-hero-inner">
          <div className="new-hero-top"><span>УРАЛЬСКИЙ ЗАВОД МЕТАЛЛОКОНСТРУКЦИЙ</span><span>ПРОИЗВОДСТВО · ЕКАТЕРИНБУРГ</span></div>
          <div className="new-hero-copy">
            <span className="new-hero-kicker">МЕТАЛЛОКОНСТРУКЦИИ / ОПОРЫ ОСВЕЩЕНИЯ</span>
            <h1>От чертежа<br />к <em>конструкции.</em></h1>
            <div className="new-hero-bottom">
              <p>Изготавливаем металлоконструкции по чертежам и подбираем типовые изделия для инфраструктурных объектов.</p>
              <Link href="/request" className="new-hero-cta">Обсудить проект <span aria-hidden>↗</span></Link>
            </div>
          </div>
          <div className="new-hero-foot"><span>01 / 04</span><span>МЕТАЛЛОКОНСТРУКЦИИ И ОПОРЫ ОСВЕЩЕНИЯ</span><span aria-hidden>↓</span></div>
        </div>
      </section>

      <section className="new-intro" id="directions"><div className="container new-intro-grid">
        <div><span className="new-label">01 / ЧТО ДЕЛАЕМ</span><h2>Решение начинается<br />с вашей задачи<span className="orange-dot">.</span></h2></div>
        <div className="new-intro-right"><p>Проектируете объект или закупаете готовое изделие? Для каждого сценария есть свой короткий путь: отправить чертёж на расчёт или найти модель в каталоге.</p><div className="new-intro-actions"><Link href="/request" className="new-inline-link">Рассчитать по чертежу <span>↗</span></Link><Link href="/catalog" className="new-inline-link">Найти изделие <span>↗</span></Link></div></div>
      </div></section>

      <section className="new-directions container">
        <Link href="/catalog/metallokonstruktsii" className="new-direction new-direction-main"><div className="new-direction-photo" aria-hidden="true" /><div className="new-direction-overlay"><span>01 / ОСНОВНОЕ НАПРАВЛЕНИЕ</span><div><h2>Металлоконструкции</h2><p>Каркасы, фермы, колонны, балки. Типовые изделия и изготовление по чертежам.</p></div><b aria-hidden>↗</b></div></Link>
        <Link href="/catalog/opory-osveshcheniya" className="new-direction new-direction-second"><div className="new-direction-line" aria-hidden="true"><span /><span /><span /></div><div className="new-direction-overlay"><span>02 / НОВОЕ НАПРАВЛЕНИЕ</span><div><h2>Опоры<br />освещения</h2><p>Опоры, мачты, закладные детали и комплектующие.</p></div><b aria-hidden>↗</b></div></Link>
      </section>

      <section className="new-catalog"><div className="container">
        <div className="new-section-head"><div><span className="new-label">02 / НОМЕНКЛАТУРА</span><h2>Найдите нужное<br />изделие</h2></div><Link href="/catalog" className="new-inline-link">Открыть весь каталог <span>↗</span></Link></div>
        <div className="new-catalog-grid">{catalogGroups.map((category, index) => <Link key={category.slug} href={`/catalog/${category.slug}`} className="new-catalog-card"><span>{String(index + 1).padStart(2, "0")}</span><h3>{category.title}</h3><p>{category.note}</p><b aria-hidden>↗</b></Link>)}</div>
        <div className="new-series"><span>Часто ищут</span>{products.slice(0, 6).map((product) => <Link href={`/product/${product.slug}`} key={product.slug}>{product.name}</Link>)}</div>
      </div></section>

      <section className="new-work" id="production"><div className="new-work-image" aria-hidden="true" /><div className="container new-work-inner"><div><span className="new-label">03 / ПРОИЗВОДСТВО</span><h2>За каждой конструкцией<br />стоит работа.</h2></div><div><p>От исходного чертежа до готового изделия. Расскажите о своём объекте, и мы обсудим параметры будущей конструкции.</p><Link href="/request" className="new-inline-link">Обсудить изготовление <span>↗</span></Link></div></div></section>

      <section className="new-process container"><div className="new-section-head"><div><span className="new-label">04 / КАК НАЧАТЬ</span><h2>От запроса<br />к расчёту</h2></div></div><div className="new-process-grid"><div><span>01</span><h3>Опишите задачу</h3><p>Назовите изделие или приложите чертёж.</p></div><div><span>02</span><h3>Уточним параметры</h3><p>Сверим размеры, количество и регион поставки.</p></div><div><span>03</span><h3>Подготовим предложение</h3><p>Рассчитаем изготовление под ваш проект.</p></div></div></section>

      <section className="new-contact"><div className="container new-contact-inner"><div><span className="new-label">ЕСТЬ ЧЕРТЁЖ ИЛИ СПЕЦИФИКАЦИЯ?</span><h2>Давайте начнём<br />с вашего объекта.</h2></div><Link href="/request" className="new-contact-button">Запросить расчёт <span aria-hidden>↗</span></Link></div></section>
    </>
  );
}



