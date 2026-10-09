import Image from "next/image";
import Link from "next/link";
import { DirectionStage } from "@/components/DirectionStage";
import { QuoteForm } from "@/components/QuoteForm";
import "./atelier.css";

const catalogLinks = [
  ["01", "Опоры освещения", "Силовые и несиловые", "/catalog/opory-osveshcheniya"],
  ["02", "Мачты освещения", "Для площадок и промышленных объектов", "/catalog/machty-osveshcheniya"],
  ["03", "Закладные детали", "Фундаменты для опор", "/catalog/zakladnye-detali"],
  ["04", "Кронштейны", "Крепления светильников", "/catalog/kronshteyny"],
];

export default function Home() {
  return (
    <div className="atelier-page">
      <section className="atelier-hero">
        <div className="container atelier-hero-grid">
          <div className="atelier-hero-title">
            <span className="atelier-kicker"><i /> УРАЛЬСКИЙ ЗАВОД / ЕКАТЕРИНБУРГ</span>
            <h1>Металло<br /><em>конструкции.</em></h1>
          </div>
          <div className="atelier-hero-side">
            <span className="atelier-mini-index">КАРКАСЫ · ФЕРМЫ · ОПОРЫ</span>
            <p>Изготавливаем каркасы, фермы и детали по чертежам. Выпускаем опоры освещения и комплектующие.</p>
            <div className="atelier-hero-actions">
              <Link href="#request" className="atelier-primary-link">Отправить чертёж <span aria-hidden="true">↗</span></Link>
              <Link href="/catalog" className="atelier-simple-link">Перейти в каталог <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
        <div className="atelier-hero-photo">
          <Image src="/images/uzm-frame.jpg" alt="Каркас здания из металлоконструкций" fill priority sizes="100vw" />
          <div className="atelier-hero-photo-grain" aria-hidden="true" />
          <div className="container atelier-hero-photo-inner">
            <div className="atelier-photo-top"><span>МЕТАЛЛОКОНСТРУКЦИИ</span><span>ФЕРМЫ / КОЛОННЫ / БАЛКИ</span></div>
            <div className="atelier-photo-bottom"><span className="atelier-photo-monogram" aria-hidden="true">УЗМ</span><span className="atelier-photo-caption">Каркас здания<br />Фото из архива УЗМ</span><Link href="#directions" aria-label="Смотреть направления" className="atelier-photo-down">↓</Link></div>
          </div>
        </div>
      </section>

      <div className="atelier-running-line" aria-hidden="true"><div>КАРКАСЫ <b>✳</b> ФЕРМЫ <b>✳</b> КОЛОННЫ <b>✳</b> ОПОРЫ ОСВЕЩЕНИЯ <b>✳</b> МАЧТЫ <b>✳</b> ИЗДЕЛИЯ ПО ЧЕРТЕЖАМ <b>✳</b></div></div>

      <section className="atelier-directions" id="directions">
        <div className="container atelier-section-heading">
          <span className="atelier-kicker"><i /> 01 / НАПРАВЛЕНИЯ</span>
          <h2>Что производим<span>.</span></h2>
          <p>Начните с нужного раздела. В каталоге можно выбрать модель, а для нестандартной конструкции — отправить чертёж.</p>
        </div>
        <div className="container"><DirectionStage /></div>
      </section>

      <section className="atelier-object" id="objects">
        <div className="container atelier-object-head">
          <span className="atelier-kicker"><i /> 02 / НА ОБЪЕКТЕ</span>
          <h2>Сталь<br /><em>в работе.</em></h2>
          <p>Каркас здания на строительной площадке. Здесь видны фермы, колонны и масштаб всей конструкции.</p>
        </div>
        <div className="atelier-object-photo">
          <Image src="/images/uzm-site-frame.png" alt="Монтаж металлокаркаса на строительной площадке" fill sizes="100vw" />
          <div className="container atelier-object-photo-caption"><span>КАРКАС ЗДАНИЯ</span><span>01 / МЕТАЛЛОКОНСТРУКЦИИ</span></div>
        </div>
      </section>

      <section className="atelier-process" id="production">
        <div className="atelier-process-image"><Image src="/images/uzm-forming.jpg" alt="Гибка листового металла" fill sizes="(max-width: 900px) 100vw, 60vw" /></div>
        <div className="atelier-process-copy">
          <span className="atelier-kicker"><i /> 03 / ПРОИЗВОДСТВО</span>
          <h2>Резка.<br />Гибка.<br /><em>Сварка.</em></h2>
          <p>Работаем с металлом по чертежам заказчика. Для расчёта нужны изделие, количество и технические параметры.</p>
          <Link href="#request" className="atelier-white-link">Запросить расчёт <span aria-hidden="true">↗</span></Link>
          <span className="atelier-process-small">УЗМ · ЕКАТЕРИНБУРГ</span>
        </div>
      </section>

      <section className="atelier-catalog">
        <div className="container atelier-catalog-head">
          <span className="atelier-kicker"><i /> 04 / НОМЕНКЛАТУРА</span>
          <div><h2>Опоры.<br />Мачты.<br />Детали<span>.</span></h2><p>Откройте группу, найдите серию и отправьте выбранную модель на расчёт.</p></div>
        </div>
        <div className="container atelier-catalog-list">
          {catalogLinks.map(([number, title, detail, href]) => (
            <Link href={href} key={href}><span>{number}</span><strong>{title}</strong><small>{detail}</small><b aria-hidden="true">↗</b></Link>
          ))}
        </div>
        <div className="container atelier-catalog-foot"><span>Нужна другая позиция?</span><Link href="/catalog">Открыть весь каталог <span aria-hidden="true">↗</span></Link></div>
      </section>

      <section className="atelier-request" id="request">
        <div className="container atelier-request-grid">
          <div className="atelier-request-intro">
            <span className="atelier-kicker"><i /> 05 / ЗАПРОС</span>
            <h2>Пришлите<br /><em>чертёж.</em></h2>
            <p>Укажите изделие, количество и регион. Файл можно приложить к форме.</p>
            <div className="atelier-request-detail"><span>Телефон отдела продаж</span><a href="tel:+79000454656">+7 900 045-46-56</a></div>
          </div>
          <div className="atelier-request-panel"><div className="atelier-request-panel-top"><span>РАСЧЁТ ИЗГОТОВЛЕНИЯ</span><span>УЗМ / ЗАЯВКА</span></div><QuoteForm /></div>
        </div>
      </section>
    </div>
  );
}
