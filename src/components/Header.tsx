"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { href: "/catalog/metallokonstruktsii", label: "Металлоконструкции" },
  { href: "/catalog/opory-osveshcheniya", label: "Опоры освещения" },
  { href: "/catalog", label: "Каталог" },
  { href: "/#production", label: "Производство" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Екатеринбург · Производство металлоконструкций</span>
          <a href="mailto:zavod@uzmzavod.ru">zavod@uzmzavod.ru</a>
        </div>
      </div>
      <div className="container main-header">
        <Link href="/" className="brand" aria-label="УЗМ Завод — на главную" onClick={() => setOpen(false)}>
          <Image src="/images/logo-color.webp" alt="УЗМ Завод" width={130} height={77} priority />
          <span className="brand-caption">Уральский завод<br />металлоконструкций</span>
        </Link>
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "is-current" : ""} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/request" className="button button-primary mobile-request" onClick={() => setOpen(false)}>Получить расчёт <span aria-hidden>↗</span></Link>
        </nav>
        <Link href="/request" className="button button-primary header-request">Получить расчёт <span aria-hidden>↗</span></Link>
        <button className={`menu-toggle ${open ? "is-open" : ""}`} type="button" aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
