import Link from "next/link";
import type { Metadata } from "next";
import { ArrowIcon } from "@/components/ArrowIcon";
export const metadata: Metadata = { title: "Контакты", description: "Контакты Уральского завода металлоконструкций в Екатеринбурге. Запрос расчёта по чертежам и спецификации." };
export default function ContactsPage() {
  return <div className="container editorial-page"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Контакты</span></div><div className="editorial-intro"><h1>Обсудим<br/>вашу задачу</h1><p>Свяжитесь с нами по телефону или отправьте спецификацию на почту. Укажите изделие, количество и регион поставки.</p></div><div className="contact-details"><div><h2>Телефон</h2><a href="tel:+79000454656">+7 900 045-46-56</a></div><div><h2>Почта</h2><a href="mailto:zavod@uzmzavod.ru">zavod@uzmzavod.ru</a></div><div><h2>Адрес</h2><p>Екатеринбург,<br/>ул. Черняховского, 66</p></div><div><h2>Уральский завод металлоизделий</h2><Link href="/request" className="button button-primary">Запросить расчёт <ArrowIcon/></Link></div></div></div>;
}
