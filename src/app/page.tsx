import { ArrowIcon } from "@/components/ArrowIcon";
import { QuoteForm } from "@/components/QuoteForm";
import Image from "next/image";
import Link from "next/link";
import "./revamp.css";

const directions = [
  { title: "Металлоконструкции", description: "Каркасы, фермы и детали по чертежам", image: "/images/uzm-frame.jpg", href: "/catalog/metallokonstruktsii" },
  { title: "Опоры освещения", description: "Силовые, несиловые и складывающиеся", image: "/images/sources/dekart-opora-installation.jpg", href: "/catalog/opory-osveshcheniya" },
  { title: "Антидроновая защита", description: "Конструкции для промышленных объектов", image: "/images/sources/batissur-antidron.png", href: "/catalog/antidronovaya-zashchita" },
];

const catalog = [
  { title: "Каркасы и фермы", image: "/images/uzm-trusses.jpg", href: "/catalog/metallokonstruktsii" },
  { title: "Опоры ОГК", image: "/images/sources/dekart-ogk.webp", href: "/catalog/nesilovye-opory" },
  { title: "Парковые светильники", image: "/images/catalog/ea9be57998382135.png", href: "/catalog/parkovye-svetilniki" },
  { title: "Антидроновая защита", image: "/images/sources/batissur-antidron.png", href: "/catalog/antidronovaya-zashchita" },
];

export default function Home() {
  return <div className="revamp-page">
    <section className="revamp-hero" aria-labelledby="revamp-title">
      <Image src="/images/uzm-frame.jpg" alt="Каркас промышленного здания" fill priority sizes="100vw" className="revamp-hero-image" />
      <div className="revamp-hero-overlay" />
      <div className="container revamp-hero-content">
        <div className="revamp-hero-copy">
          <p className="revamp-overline">Производство в Екатеринбурге</p>
          <h1 id="revamp-title"><span>Металло<wbr />конструкции</span><span>для промышленного</span><span>строительства</span></h1>
          <p className="revamp-hero-lead">Изготавливаем каркасы, фермы и детали по чертежам заказчика. Подбираем опоры освещения и комплектующие для инфраструктурных проектов.</p>
          <div className="revamp-hero-actions">
            <Link className="revamp-button revamp-button-primary" href="/request">Запросить расчёт <ArrowIcon /></Link>
            <Link className="revamp-button revamp-button-outline" href="/catalog">Открыть каталог <ArrowIcon /></Link>
          </div>
        </div>
        <div className="revamp-hero-bottom"><span>Екатеринбург · Работаем по проектной документации</span><a href="#directions" aria-label="Перейти к направлениям"><ArrowIcon direction="down" /></a></div>
      </div>
    </section>

    <section className="revamp-directions" id="directions">
      <div className="container revamp-section-top"><p>Что производим</p><div><h2>Изделия для строительства и инфраструктуры</h2><span>Выберите группу изделий или пришлите чертёж на расчёт.</span></div></div>
      <div className="revamp-direction-grid">
        {directions.map((item) => <Link className="revamp-direction" href={item.href} key={item.href}>
          <div className="revamp-direction-image"><Image src={item.image} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="revamp-direction-copy"><h3>{item.title}</h3><p>{item.description}</p><ArrowIcon /></div>
        </Link>)}
      </div>
    </section>

    <section className="revamp-work">
      <div className="revamp-work-image"><Image src="/images/uzm-frame.jpg" alt="Каркас здания из стальных конструкций" fill sizes="(max-width: 900px) 100vw, 58vw" /></div>
      <div className="revamp-work-copy"><p className="revamp-overline">Металл на объекте</p><h2>От чертежа<br />к конструкции</h2><p>Для расчёта достаточно проекта, объёма и требований к покрытию. Подготовим предложение на изготовление и согласуем состав заказа.</p><Link href="/catalog/metallokonstruktsii" className="revamp-text-link">Смотреть металлоконструкции <ArrowIcon /></Link></div>
    </section>

    <section className="revamp-catalog" id="catalog">
      <div className="container revamp-catalog-head"><div><p className="revamp-overline">Каталог</p><h2>Найдите нужную серию</h2></div><Link href="/catalog" className="revamp-text-link">Весь каталог <ArrowIcon /></Link></div>
      <div className="container revamp-catalog-grid">{catalog.map((item) => <Link href={item.href} className="revamp-catalog-card" key={item.href}><div className="revamp-catalog-image"><Image src={item.image} alt="" fill sizes="(max-width: 680px) 50vw, 25vw" /></div><span>{item.title}<ArrowIcon /></span></Link>)}</div>
    </section>

    <section className="revamp-production"><div className="revamp-production-image"><Image src="/images/uzm-forming.jpg" alt="Гибка металлической детали" fill sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="revamp-production-copy"><p className="revamp-overline">Производство</p><h2>Детали решают</h2><p>Резка, гибка и сварка по рабочей документации. На странице производства собрали направления и путь изделия от запроса до поставки.</p><Link href="/production" className="revamp-text-link">О производстве <ArrowIcon /></Link></div></section>

    <section className="revamp-request" id="request"><div className="container revamp-request-grid"><div><p className="revamp-overline">Расчёт проекта</p><h2>Есть чертёж?<br />Начнём с него.</h2><p>Укажите изделие, количество и регион. Если есть проект или спецификация, приложите файл.</p><a href="tel:+79000454656">+7 900 045-46-56</a></div><div className="revamp-request-form"><QuoteForm /></div></div></section>
  </div>;
}
