import importedProducts from "./products.json";
import dekartFullProducts from "./dekart-full.json";
import verifiedProducts from "./verified-products.json";
import { categoryContent, extraCategories } from "./catalog-content";

export type Direction = "metal" | "lighting";
export type VisualKind = "pole" | "mast" | "structure" | "bracket" | "foundation" | "pile" | "pipe" | "base" | "luminaire" | "frame";

export type Category = {
  slug: string;
  title: string;
  direction: Direction;
  note: string;
  image?: string;
  parentSlug?: string;
  description?: string;
  application?: string;
  selection?: string[];
  visual?: VisualKind;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  family: string;
  form: string;
  purpose: string;
  description?: string;
  visual?: VisualKind;
  image?: string;
  sourceUrl?: string;
  specifications?: { label: string; value: string }[];
  specificationTitle?: string;
  variantTable?: { headers: string[]; rows: string[][] };
};

const originalCategories: Category[] = [
  { slug: "metallokonstruktsii", title: "Металлоконструкции", direction: "metal", note: "Каркасы, фермы, колонны и изделия по чертежам", image: "/images/uzm-frame.jpg" },
  { slug: "sendvich-paneli", title: "Каркасы под сэндвич-панели", direction: "metal", note: "Каркас здания под обшивку сэндвич-панелями", image: "/images/construction.webp" },
  { slug: "metalloobrabotka", title: "Металлообработка", direction: "metal", note: "Резка, гибка и сварка металла", image: "/images/service.webp" },
  { slug: "opory-osveshcheniya", title: "Опоры освещения", direction: "lighting", note: "Силовые, несиловые и складывающиеся опоры", image: "/images/sources/dekart-opora-installation.jpg" },
  { slug: "machty-osveshcheniya", title: "Мачты освещения", direction: "lighting", note: "Мачты со стационарной и мобильной короной" },
  { slug: "zakladnye-detali", title: "Закладные детали", direction: "lighting", note: "Фундаментные элементы для опор" },
  { slug: "parkovye-opory", title: "Парковые опоры", direction: "lighting", note: "Опоры для пешеходных и общественных пространств" },
  { slug: "svetilniki", title: "Светильники", direction: "lighting", note: "Светотехнические решения" },
  { slug: "zhd-opory", title: "Ж/Д опоры контактной сети", direction: "lighting", note: "Опоры для железнодорожной инфраструктуры" },
  { slug: "machty-svyazi", title: "Мачты связи", direction: "lighting", note: "Опоры для телекоммуникационного оборудования" },
  { slug: "opory-lep", title: "Опоры ЛЭП", direction: "lighting", note: "Решения для линий электропередачи" },
  { slug: "svetofornye-opory", title: "Светофорные опоры", direction: "lighting", note: "Опоры для дорожной инфраструктуры" },
  { slug: "prozhektornye-machty", title: "Прожекторные мачты", direction: "lighting", note: "Освещение больших площадок и объектов" },
  { slug: "molnieotvody", title: "Молниеотводы", direction: "lighting", note: "Защита объектов от молний" },
  { slug: "kronshteyny", title: "Кронштейны", direction: "lighting", note: "Крепления светильников и оборудования" },
  { slug: "opory-kontaktnoy-seti", title: "Опоры контактной сети", direction: "lighting", note: "Опоры транспортной инфраструктуры" },
  { slug: "vintovye-svai", title: "Винтовые сваи", direction: "lighting", note: "Фундаментные решения" },
  { slug: "ramnye-opory", title: "Рамные опоры дорожных знаков", direction: "lighting", note: "Г-образные, П-образные и Т-образные рамы" },
  { slug: "tsokoli", title: "Цоколи", direction: "lighting", note: "Основания для опор" }
];

// Названия серий взяты из открытого каталога dekart.tech.
// Технические параметры и доступность УЗМ подтверждает перед публикацией.
const originalProducts: Product[] = [
  { slug: "ogk", name: "ОГК", categorySlug: "opory-osveshcheniya", family: "Несиловые гранёные", form: "Гранёная", purpose: "Несиловая", image: "/images/sources/dekart-ogk.webp" },
  { slug: "ogkf", name: "ОГКф", categorySlug: "opory-osveshcheniya", family: "Несиловые гранёные", form: "Гранёная", purpose: "Несиловая" },
  { slug: "nfg", name: "НФГ", categorySlug: "opory-osveshcheniya", family: "Несиловые гранёные", form: "Гранёная", purpose: "Несиловая" },
  { slug: "npg", name: "НПГ", categorySlug: "opory-osveshcheniya", family: "Несиловые гранёные", form: "Гранёная", purpose: "Несиловая" },
  { slug: "nfk", name: "НФК", categorySlug: "opory-osveshcheniya", family: "Несиловые круглоконические", form: "Круглоконическая", purpose: "Несиловая" },
  { slug: "npk", name: "НПК", categorySlug: "opory-osveshcheniya", family: "Несиловые круглоконические", form: "Круглоконическая", purpose: "Несиловая" },
  { slug: "sfk", name: "СФК", categorySlug: "opory-osveshcheniya", family: "Силовые круглоконические", form: "Круглоконическая", purpose: "Силовая" },
  { slug: "sfg", name: "СФГ", categorySlug: "opory-osveshcheniya", family: "Силовые гранёные", form: "Гранёная", purpose: "Силовая" },
  { slug: "spg", name: "СПГ", categorySlug: "opory-osveshcheniya", family: "Силовые гранёные", form: "Гранёная", purpose: "Силовая" },
  { slug: "ogsf", name: "ОГСф", categorySlug: "opory-osveshcheniya", family: "Силовые гранёные", form: "Гранёная", purpose: "Силовая" },
  { slug: "sf", name: "СФ", categorySlug: "opory-osveshcheniya", family: "Силовые трубчатые", form: "Трубчатая", purpose: "Силовая" },
  { slug: "nf", name: "НФ", categorySlug: "opory-osveshcheniya", family: "Несиловые трубчатые", form: "Трубчатая", purpose: "Несиловая" },
  { slug: "ogks", name: "ОГКС", categorySlug: "opory-osveshcheniya", family: "Складывающиеся гранёные", form: "Гранёная", purpose: "Складывающаяся" },
  { slug: "mos", name: "МО-С", categorySlug: "opory-osveshcheniya", family: "Складывающиеся гранёные", form: "Гранёная", purpose: "Складывающаяся" },
  { slug: "ms-s", name: "МС-С", categorySlug: "machty-osveshcheniya", family: "Со стационарной короной", form: "Мачта", purpose: "Освещение" },
  { slug: "mgf", name: "МГФ", categorySlug: "machty-osveshcheniya", family: "С мобильной короной", form: "Мачта", purpose: "Освещение" },
  { slug: "ogsg", name: "ОГСГ", categorySlug: "svetofornye-opory", family: "Светофорные опоры", form: "Гранёная", purpose: "Дорожная инфраструктура" },
  { slug: "ksg-f", name: "КСГ-Ф", categorySlug: "opory-kontaktnoy-seti", family: "Опоры контактной сети", form: "Гранёная", purpose: "Контактная сеть" },
  { slug: "ukrytie-antidron", name: "Укрытие АНТиДРОН", categorySlug: "antidronovaya-zashchita", family: "Антидроновая защита", form: "Защитная конструкция", purpose: "Защита объекта", image: "/images/sources/batissur-antidron.png", sourceUrl: "https://batissur.ru/catalog/ant-dron/ant-dron-1/", description: "Защитная конструкция для объекта. Состав и исполнение определяются проектом." }
];

export const categories: Category[] = [...originalCategories, ...extraCategories].map((item) => {
  const merged = { ...item, ...categoryContent[item.slug] };
  return { ...merged, image: merged.image?.includes("/images/categories/") || merged.image?.includes("lighting-poles-hero") || merged.image?.includes("uzm-site-frame") ? undefined : merged.image };
});
// Keep previously shared product URLs; the new registry overrides their category and content.
const verifiedContent: Record<string, Partial<Product>> = verifiedProducts;
export const products: Product[] = ([...originalProducts.filter((item) => !importedProducts.some((product) => product.slug === item.slug)).map((item) => item.categorySlug === "opory-osveshcheniya" ? { ...item, categorySlug: item.purpose === "Силовая" ? "silovye-opory" : item.purpose === "Несиловая" ? "nesilovye-opory" : "skladyvayushchiesya-opory" } : item), ...importedProducts, ...dekartFullProducts] as Product[]).map((item) => {
  const merged = { ...item, ...verifiedContent[item.slug] };
  return { ...merged, image: merged.slug === "ogk" ? "/images/sources/dekart-ogk.webp" : merged.image?.startsWith("/images/generated/") ? undefined : merged.image };
});
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const getChildren = (slug: string) => categories.filter((item) => item.parentSlug === slug);
export function getCategoryProducts(slug: string): Product[] {
  const slugs = new Set([slug, ...getChildren(slug).map((item) => item.slug)]);
  return products.filter((item) => slugs.has(item.categorySlug));
}
export function getCategoryTrail(slug: string): Category[] {
  const item = getCategory(slug);
  return item ? [...(item.parentSlug ? getCategoryTrail(item.parentSlug) : []), item] : [];
}
