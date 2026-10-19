"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("main section, .product-information, .product-layout"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("reveal-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.04, rootMargin: "0px 0px 30px 0px" });
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top < innerHeight || node.matches(".stage-hero")) return;
      node.classList.add("reveal-pending"); observer.observe(node);
    });
    return () => { observer.disconnect(); nodes.forEach((node) => node.classList.remove("reveal-pending", "reveal-visible")); };
  }, [pathname]);
  return null;
}
