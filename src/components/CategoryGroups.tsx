import Link from "next/link";
import Image from "next/image";
import { ArrowIcon } from "./ArrowIcon";
import { getCategoryProducts, type Category } from "@/data/catalog";

export function CategoryGroups({ items }: { items: Category[] }) {
  return <div className="category-groups">{items.map((item) => <Link href={`/catalog/${item.slug}`} key={item.slug} className="category-group-link">{item.image && <div className="category-group-image"><Image src={item.image} alt="" fill sizes="(max-width: 620px) 100vw, 33vw" /></div>}<div className="category-group-copy"><h3>{item.title}</h3><p>{item.note}</p><span>{getCategoryProducts(item.slug).length ? `Изделий: ${getCategoryProducts(item.slug).length}` : "По вашему проекту"}</span></div><ArrowIcon /></Link>)}</div>;
}
