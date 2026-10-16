"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon } from "./ArrowIcon";

const slides = [
  {
    image: "/images/uzm-frame.jpg",
    alt: "Стальной каркас промышленного здания",
    label: "Промышленное строительство",
    title: <>Изготовление металло<wbr />конструкций</>,
    description: "Каркасы, фермы и детали по рабочим чертежам. Рассчитаем изготовление по спецификации и объёму.",
    href: "/catalog/metallokonstruktsii",
    link: "Металлоконструкции",
  },
  {
    image: "/images/sources/dekart-opora-installation.jpg",
    alt: "Монтаж опоры освещения на объекте",
    label: "Городская инфраструктура",
    title: "Опоры освещения и комплектующие",
    description: "Силовые, несиловые и складывающиеся опоры. Подбор серии, высоты и исполнения под условия объекта.",
    href: "/catalog/opory-osveshcheniya",
    link: "Опоры освещения",
  },
];

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 8000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="stage-hero" aria-label="Основные направления производства" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((slide, index) => (
        <div className={`stage-slide ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} key={slide.image}>
          <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" className="stage-slide-image" />
        </div>
      ))}
      <div className="stage-hero-shade" />
      <div className="stage-hero-content container">
        <div className="stage-hero-main" key={active}>
          <p className="stage-hero-kicker">{slides[active].label}</p>
          <div className="stage-hero-message">
            <h1>{slides[active].title}</h1>
            <div className="stage-hero-side">
              <p>{slides[active].description}</p>
              <div className="stage-hero-actions">
                <Link href="/request" className="stage-hero-cta">Запросить расчёт<ArrowIcon /></Link>
                <Link href={slides[active].href} className="stage-hero-link">{slides[active].link}<ArrowIcon /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="stage-hero-bottom">
          <div className="stage-hero-controls" aria-label="Слайды направлений">
            {slides.map((slide, index) => (
              <button type="button" className={index === active ? "is-active" : ""} aria-label={`Показать: ${slide.label}`} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} key={slide.label}>
                <span>0{index + 1}</span><span className="stage-control-track" />
              </button>
            ))}
          </div>
          <a href="#directions" className="stage-hero-down" aria-label="Перейти к продукции"><span>Продукция</span><ArrowIcon direction="down" /></a>
        </div>
      </div>
    </section>
  );
}
