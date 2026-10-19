import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import "@fontsource-variable/manrope";
import "@fontsource-variable/commissioner";
import "./globals.css";
import "./internal-refresh.css";
import "./catalog-refinement.css";
import "./revamp.css";
import "./stage-design.css";
import "./product-detail.css";

export const metadata: Metadata = {
  title: { default: "Уральский завод металлоизделий — металлоконструкции и опоры освещения", template: "%s | Уральский завод металлоизделий" },
  description: "Уральский завод металлоизделий. Каркасы зданий и технологические конструкции, опоры освещения, мачты, сваи и изделия по чертежам. Расчёт по спецификации проекта."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
