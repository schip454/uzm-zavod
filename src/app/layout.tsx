import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "@fontsource-variable/manrope";
import "@fontsource-variable/commissioner";
import "./globals.css";
import "./internal-refresh.css";

export const metadata: Metadata = {
  title: { default: "УЗМ Завод — металлоконструкции и опоры освещения", template: "%s | УЗМ Завод" },
  description: "Металлоконструкции по чертежам и каталог опор освещения. Прототип нового сайта УЗМ."
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
