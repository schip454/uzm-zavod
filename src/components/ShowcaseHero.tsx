"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/hero.jpeg",
    label: "МЕТАЛЛОКОНСТРУКЦИИ · ЕКАТЕРИНБУРГ",
    title: <>Задайте<br />масштаб<span>.</span></>,
    description: "Изготавливаем металлоконструкции для промышленных и инфраструктурных объектов.",
    href: "/catalog/metallokonstruktsii",
    link: "Металлоконструкции",
  },
  {
    image: "/images/uzm-frame.jpg",
    label: "КОНСТРУКЦИИ ПО ВАШЕМУ ПРОЕКТУ",
    title: <>От чертежа<br />до объекта<span>.</span></>,
    description: "Каркасы, фермы и элементы зданий. Рассчитаем изготовление по вашей спецификации.",
    href: "/request",
    link: "Отправить чертёж",
  },
];

export function ShowcaseHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const current = slides[active];

  return (
    <section className="showcase-hero" aria-label="Уральский завод металлоконструкций" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="showcase-hero-scenes" aria-hidden="true">
        {slides.map((slide, index) => (
          <div key={slide.image} className={`showcase-hero-scene ${active === index ? "is-active" : ""}`} style={{ backgroundImage: `url(${slide.image})` }} />
        ))}
      </div>
      <div className="showcase-hero-shade" aria-hidden="true" />
      <div className="container showcase-hero-content">
        <div className="showcase-hero-topline"><span>УРАЛЬСКИЙ ЗАВОД МЕТАЛЛОКОНСТРУКЦИЙ</span><span>0{active + 1} / 0{slides.length}</span></div>
        <div key={active} className="showcase-hero-text">
          <p className="showcase-eyebrow">{current.label}</p>
          <h1>{current.title}</h1>
          <div className="showcase-hero-lead">
            <p>{current.description}</p>
            <Link href={current.href} className="showcase-round-link" aria-label={current.link}><span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="showcase-hero-bottom">
          <Link href="#directions" className="showcase-scroll-cue">ЛИСТАЙТЕ ВНИЗ <span aria-hidden="true">↓</span></Link>
          <div className="showcase-hero-controls" aria-label="Переключение кадров">
            <span>0{active + 1}<i />0{slides.length}</span>
            <button type="button" aria-label="Предыдущий кадр" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>←</button>
            <button type="button" aria-label="Следующий кадр" onClick={() => setActive((active + 1) % slides.length)}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
