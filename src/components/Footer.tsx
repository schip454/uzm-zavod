import { ArrowIcon } from "@/components/ArrowIcon";
import { LightLogo } from "@/components/LightLogo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <LightLogo className="footer-light-mark" id="footer-light-logo-alpha" />
          <p>Уральский завод металлоизделий</p>
        </div>
        <div>
          <div className="footer-label">Навигация</div>
          <Link href="/catalog">Каталог продукции</Link>
          <Link href="/catalog/metallokonstruktsii">Металлоконструкции</Link>
          <Link href="/catalog/opory-osveshcheniya">Опоры освещения</Link>
          <Link href="/production">Производство</Link>
          <Link href="/contacts">Контакты</Link>
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
          <Link href="/request" className="button button-outline-light">Отправить запрос <ArrowIcon /></Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} УЗМ Завод · ООО «Уральский завод металлоконструкций»</span>
        <span>Информация на сайте не является публичной офертой.</span>
      </div>
    </footer>
  );
}
