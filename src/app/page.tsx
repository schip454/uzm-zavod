import Link from "next/link";
import { categories, products } from "@/data/catalog";
import { ProductVisual } from "@/components/ProductVisual";

const featured = categories.filter((category) => ["opory-osveshcheniya", "machty-osveshcheniya", "zakladnye-detali", "kronshteyny", "vintovye-svai", "svetofornye-opory"].includes(category.slug));

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-image" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow light">УЗМ · ЕКАТЕРИНБУРГ</span>
            <h1>Металлоконструкции<br /><em>по чертежам</em></h1>
            <p>Изготавливаем конструкции по вашему проекту. Подбираем типовые опоры освещения и готовим расчёт под параметры объекта.</p>
            <div className="hero-actions">
              <Link href="/request" className="button button-primary">Получить расчёт <span aria-hidden>↗</span></Link>
              <Link href="/catalog" className="button button-ghost">Перейти в каталог <span aria-hidden>→</span></Link>
            </div>
          </div>
          <div className="hero-index"><span>01</span><i /><span>ПРОИЗВОДСТВО И ПОСТАВКА</span></div>
        </div>
      </section>

      <section className="section directions-section" id="directions">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">01 / НАПРАВЛЕНИЯ</span><h2>От чертежа до готового изделия</h2></div><p>Два направления собраны в одном каталоге. Сначала найдите нужную группу, затем отправьте параметры для расчёта.</p></div>
          <div className="direction-grid">
            <Link href="/catalog/metallokonstruktsii" className="direction-card direction-card-metal">
              <div className="direction-card-image" />
              <div className="direction-card-content"><span className="card-index">01 / ОСНОВНОЕ НАПРАВЛЕНИЕ</span><h3>Металлоконструкции</h3><p>Каркасы, фермы, балки и нестандартные изделия по проекту.</p><span className="text-link">Смотреть направление <b aria-hidden>↗</b></span></div>
            </Link>
            <Link href="/catalog/opory-osveshcheniya" className="direction-card direction-card-lighting">
              <ProductVisual className="direction-visual" />
              <div className="direction-card-content"><span className="card-index">02 / НОВОЕ НАПРАВЛЕНИЕ</span><h3>Опоры освещения</h3><p>Типовые серии, семейства и подбор под параметры объекта.</p><span className="text-link">Смотреть направление <b aria-hidden>↗</b></span></div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section catalog-preview">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">02 / КАТАЛОГ</span><h2>Быстрый вход в номенклатуру</h2></div><Link href="/catalog" className="text-link">Весь каталог <b aria-hidden>↗</b></Link></div>
          <div className="category-grid">
            {featured.map((category, index) => <Link className="category-tile" href={`/catalog/${category.slug}`} key={category.slug}><span className="category-index">{String(index + 1).padStart(2, "0")}</span><span className="category-tile-title">{category.title}</span><span className="category-tile-note">{category.note}</span><span className="category-arrow" aria-hidden>↗</span></Link>)}
          </div>
          <div className="series-strip"><span>Популярные обозначения</span><div>{products.slice(0, 6).map((product) => <Link href={`/product/${product.slug}`} key={product.slug}>{product.name}</Link>)}</div></div>
        </div>
      </section>

      <section className="section production-section" id="production">
        <div className="container production-grid">
          <div className="production-photo"><span>УЗМ / ПРОИЗВОДСТВО</span></div>
          <div className="production-content"><span className="eyebrow">03 / ПРОИЗВОДСТВО</span><h2>Проект начинается с деталей</h2><p>Режем, гнём и свариваем металл, изготавливаем конструкции по чертежам. Пришлите задачу: технолог уточнит размеры, материал и требования к изделию.</p><div className="production-list"><div><span>01</span>Изделия по чертежам</div><div><span>02</span>Металлообработка</div><div><span>03</span>Типовая продукция</div></div><Link href="/request" className="text-link">Обсудить задачу <b aria-hidden>↗</b></Link></div>
        </div>
      </section>

      <section className="section steps-section">
        <div className="container"><div className="section-heading"><div><span className="eyebrow">04 / КАК НАЧАТЬ</span><h2>Достаточно заявки и исходных данных</h2></div></div><div className="steps-grid"><div><span>01</span><h3>Выберите изделие</h3><p>Откройте группу каталога или опишите нестандартную задачу.</p></div><div><span>02</span><h3>Пришлите параметры</h3><p>Укажите количество и регион. Чертёж можно приложить к запросу.</p></div><div><span>03</span><h3>Получите расчёт</h3><p>Менеджер уточнит детали и подготовит предложение.</p></div></div></div>
      </section>

      <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow light">СЛЕДУЮЩИЙ ШАГ</span><h2>Есть задача по металлу?</h2><p>Пришлите чертёж или название изделия. Начнём с расчёта.</p></div><Link href="/request" className="button button-primary">Отправить запрос <span aria-hidden>↗</span></Link></div></section>
    </>
  );
}
