"use client";

import { ArrowIcon } from "@/components/ArrowIcon";

import { FormEvent, useState } from "react";

export function QuoteForm({ initialProduct = "" }: { initialProduct?: string }) {
  const [checked, setChecked] = useState(false);
  const [fileName, setFileName] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDraft(Object.fromEntries(["phone", "email", "region", "inn", "product", "quantity", "comment"].map((key) => [key, String(data.get(key) ?? "").trim()])));
    setChecked(true);
  }

  if (checked) {
    return (
      <div className="form-result" role="status">
        <span className="result-mark" aria-hidden>✓</span>
        <h2>Проверьте заявку</h2>
        <dl className="form-review">
          {[["Изделие", draft.product], ["Количество", draft.quantity], ["Регион", draft.region], ["Телефон", draft.phone], ["Почта", draft.email], ["ИНН", draft.inn], ["Комментарий", draft.comment]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {fileName && <p>Файл «{fileName}» приложите к письму после открытия почты.</p>}
        <a className="button button-primary" href={`mailto:zavod@uzmzavod.ru?subject=${encodeURIComponent(`Запрос расчёта: ${draft.product}`)}&body=${encodeURIComponent(`Изделие: ${draft.product}\nКоличество: ${draft.quantity}\nРегион: ${draft.region}\nТелефон: ${draft.phone}\nПочта: ${draft.email}\nИНН: ${draft.inn}\nКомментарий: ${draft.comment}\n\nСтраница: ${typeof window === "undefined" ? "" : window.location.href}${fileName ? `\nФайл: ${fileName} (приложить к письму)` : ""}`)}`}>Открыть письмо <ArrowIcon /></a>
        <button className="button button-dark" onClick={() => { setChecked(false); setFileName(""); }}>Изменить заявку</button>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label><span>Телефон <b>*</b></span><input name="phone" type="tel" defaultValue={draft.phone} placeholder="+7 (___) ___-__-__" autoComplete="tel" required /></label>
        <label><span>Почта <b>*</b></span><input name="email" type="email" defaultValue={draft.email} placeholder="name@company.ru" autoComplete="email" required /></label>
        <label><span>Регион <b>*</b></span><input name="region" defaultValue={draft.region} placeholder="Город или область" required /></label>
        <label><span>ИНН <b>*</b></span><input name="inn" defaultValue={draft.inn} inputMode="numeric" pattern="[0-9]{10}|[0-9]{12}" title="Введите 10 или 12 цифр" placeholder="10 или 12 цифр" required /></label>
        <label><span>Изделие <b>*</b></span><input name="product" defaultValue={draft.product ?? initialProduct} placeholder="Название или обозначение" required /></label>
        <label><span>Количество <b>*</b></span><input name="quantity" defaultValue={draft.quantity} inputMode="numeric" type="number" min="1" placeholder="Штук" required /></label>
      </div>
      <label><span>Комментарий <b>*</b></span><textarea name="comment" defaultValue={draft.comment} rows={4} placeholder="Размеры, сроки, особенности проекта" required /></label>
      <label className="file-input"><span>Приложить чертёж или ТЗ</span><span className="file-picker"><span className="file-picker-action">Выбрать файл <b aria-hidden="true">＋</b></span><span className="file-picker-name">{fileName || "PDF, DWG, DXF, JPG или PNG"}</span></span><input className="file-native" name="attachment" type="file" accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /></label>
      <label className="consent"><input type="checkbox" required /> <span>Согласен на обработку персональных данных для ответа на заявку. <a href="https://uzmzavod.ru/privacy-policy/" target="_blank" rel="noreferrer">Политика конфиденциальности</a>.</span></label>
      <div className="form-actions"><button className="button button-primary" type="submit">Проверить данные <ArrowIcon /></button></div>
    </form>
  );
}
