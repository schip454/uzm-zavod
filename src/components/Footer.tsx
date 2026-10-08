import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/logo.webp" alt="УЗМ Завод" width={126} height={74} />
          <p>Уральский завод металлоконструкций</p>
        </div>
        <div>
          <div className="footer-label">Навигация</div>
          <Link href="/catalog">Каталог продукции</Link>
          <Link href="/catalog/metallokonstruktsii">Металлоконструкции</Link>
          <Link href="/catalog/opory-osveshcheniya">Опоры освещения</Link>
        </div>
        <div>
          <div className="footer-label">Контакты</div>
          <a href="mailto:zavod@uzmzavod.ru">zavod@uzmzavod.ru</a>
          <a href="tel:+79000454656">+7 900 045-46-56</a>
          <span>Екатеринбург, ул. Черняховского, 66</span>
        </div>
        <div className="footer-action">
          <div className="footer-label">Есть чертёж или спецификация?</div>
          <p>Отправьте задачу. Разберёмся в составе изделия и подготовим расчёт.</p>
          <Link href="/request" className="button button-outline-light">Отправить запрос <span aria-hidden>↗</span></Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} УЗМ Завод</span>
        <span>Информация на сайте не является публичной офертой.</span>
      </div>
    </footer>
  );
}
