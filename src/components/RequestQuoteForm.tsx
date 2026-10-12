"use client";

import { useSearchParams } from "next/navigation";
import { QuoteForm } from "@/components/QuoteForm";

export function RequestQuoteForm() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product") ?? "";
  return <QuoteForm key={product} initialProduct={product} />;
}
