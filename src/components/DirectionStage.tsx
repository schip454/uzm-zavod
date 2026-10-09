"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const directions = [
  {
    title: "Металлоконструкции",
    note: "Каркасы, фермы, колонны, балки и детали по чертежам",
    href: "/catalog/metallokonstruktsii",
    tag: "ОСНОВНОЕ НАПРАВЛЕНИЕ",
  },
  {
    title: "Опоры освещения",
    note: "Опоры, мачты, закладные детали и кронштейны",
    href: "/catalog/opory-osveshcheniya",
    tag: "ИНФРАСТРУКТУРА",
  },
];

export function DirectionStage() {
  const [active, setActive] = useState(0);
  const selected = directions[active];

  return (
    <div className="atelier-direction-stage">
      <div className="atelier-direction-list">
        {directions.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={active === index ? "is-active" : ""}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <span className="atelier-direction-main"><strong>{index === 0 ? <>Металло<wbr />конструкции</> : item.title}</strong><small>{item.note}</small></span>
            <span className="atelier-direction-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
        <div className="atelier-direction-footer"><span>По чертежам заказчика и типовым сериям</span><Link href="/catalog">Весь каталог <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className={`atelier-direction-visual ${active === 1 ? "is-lighting" : ""}`}>
        {active === 0 ? (
          <Image src="/images/uzm-trusses.jpg" alt="Стальные фермы" fill sizes="(max-width: 900px) 100vw, 50vw" />
        ) : (
          <Image src="/images/lighting-poles-prototype.png" alt="Опоры освещения у промышленного объекта" fill sizes="(max-width: 900px) 100vw, 50vw" />
        )}
        <div className="atelier-direction-visual-top"><span>{selected.tag}</span></div>
        <Link href={selected.href} className="atelier-direction-visual-bottom"><span>{selected.title}</span><b aria-hidden="true">↗</b></Link>
      </div>
    </div>
  );
}
