"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/catalog";
import { ProductImage } from "./ProductImage";

export function ProductGallery({ product }: { product: Pick<Product, "name" | "image" | "gallery"> }) {
  const images = product.gallery?.length ? product.gallery : product.image ? [{ src: product.image, alt: product.name }] : [];
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const change = (step: number) => setActive((current) => (current + step + images.length) % images.length);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const close = () => { document.body.style.overflow = ""; };
    el.addEventListener("close", close);
    return () => { el.removeEventListener("close", close); close(); };
  }, []);
  if (!images.length) return <div className="product-art"><ProductImage product={product} priority /></div>;
  const selected = images[active];
  return <div className="product-gallery" onKeyDown={(event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
  }}>
    {images.length > 1 && <div className="product-gallery-thumbs" aria-label="Фотографии изделия">
      {images.map((item, index) => <button type="button" key={item.src} aria-label={`Фото ${index + 1}: ${item.alt}`} aria-pressed={active === index} onClick={() => setActive(index)} className={active === index ? "is-active" : ""}><Image src={item.src} alt="" fill sizes="76px" /></button>)}
    </div>}
    <div className="product-gallery-main">
      <button type="button" className="product-gallery-open" aria-label={`Увеличить изображение: ${selected.alt}`} onClick={() => { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }}>
        <Image key={selected.src} src={selected.src} alt={selected.alt} fill priority={active === 0} sizes="(max-width: 900px) 90vw, 48vw" />
        <span className="gallery-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" /></svg></span>
      </button>
      {images.length > 1 && <div className="product-gallery-controls"><button type="button" aria-label="Предыдущее фото" onClick={() => change(-1)}><Chevron reverse /></button><span aria-live="polite">{active + 1} / {images.length}</span><button type="button" aria-label="Следующее фото" onClick={() => change(1)}><Chevron /></button></div>}
    </div>
    <dialog ref={dialog} className="gallery-dialog" aria-label={product.name} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button type="button" className="gallery-dialog-close" aria-label="Закрыть изображение" onClick={() => dialog.current?.close()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 5 14 14M19 5 5 19" /></svg></button>
      <div className="gallery-dialog-image"><Image src={selected.src} alt={selected.alt} fill sizes="90vw" /></div>
      {images.length > 1 && <div className="product-gallery-controls"><button type="button" aria-label="Предыдущее фото" onClick={() => change(-1)}><Chevron reverse /></button><span aria-live="polite">{active + 1} / {images.length}</span><button type="button" aria-label="Следующее фото" onClick={() => change(1)}><Chevron /></button></div>}
    </dialog>
  </div>;
}

function Chevron({ reverse = false }: { reverse?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ transform: reverse ? "rotate(180deg)" : undefined }}><path d="m9 5 7 7-7 7" /></svg>;
}
