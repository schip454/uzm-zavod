import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "@fontsource-variable/manrope";
import "@fontsource-variable/commissioner";
import "./globals.css";
import "./internal-refresh.css";
import "./catalog-refinement.css";

export const metadata: Metadata = {
  title: { default: "УЗМ Завод — металлоконструкции и опоры освещения", template: "%s | УЗМ Завод" },
  description: "Уральский завод металлоконструкций. Каркасы зданий и технологические конструкции, опоры освещения, мачты, сваи и изделия по чертежам. Расчёт по спецификации проекта."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
