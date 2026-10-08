import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = { title: "Запросить расчёт" };

type Props = { searchParams: Promise<{ product?: string }> };

export default async function RequestPage({ searchParams }: Props) {
  const { product } = await searchParams;
  return <div className="container request-page"><div className="breadcrumbs"><Link href="/">Главная</Link><span>/</span><span>Получить расчёт</span></div><div className="request-layout"><div className="request-intro"><span className="eyebrow">ОБСУДИМ ПРОЕКТ</span><h1>Расскажите, что нужно изготовить</h1><p>Заполните параметры изделия и приложите чертёж, если он уже есть. Контакты нужны, чтобы уточнить детали и подготовить предложение.</p><div className="request-side-note"><span>01</span><div><strong>Типовое изделие</strong><p>Укажите серию, количество и регион.</p></div></div><div className="request-side-note"><span>02</span><div><strong>Изделие по чертежу</strong><p>Приложите файл и опишите задачу.</p></div></div></div><div className="request-form-wrap"><QuoteForm initialProduct={product ?? ""} /></div></div></div>;
}
