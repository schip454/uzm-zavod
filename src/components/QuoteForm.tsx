"use client";

import { FormEvent, useState } from "react";

export function QuoteForm({ initialProduct = "" }: { initialProduct?: string }) {
  const [checked, setChecked] = useState(false);
  const [fileName, setFileName] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecked(true);
  }

  if (checked) {
    return (
      <div className="form-result" role="status">
        <span className="result-mark" aria-hidden>✓</span>
        <h2>Данные заполнены</h2>
        <p>Проверьте чертёж, количество и контакты перед отправкой запроса.</p>
        <button className="button button-dark" onClick={() => setChecked(false)}>Изменить заявку</button>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label><span>Телефон <b>*</b></span><input name="phone" type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" required /></label>
        <label><span>Почта <b>*</b></span><input name="email" type="email" placeholder="name@company.ru" autoComplete="email" required /></label>
        <label><span>Регион <b>*</b></span><input name="region" placeholder="Город или область" required /></label>
        <label><span>ИНН <b>*</b></span><input name="inn" inputMode="numeric" pattern="[0-9]{10}|[0-9]{12}" title="Введите 10 или 12 цифр" placeholder="10 или 12 цифр" required /></label>
        <label><span>Изделие <b>*</b></span><input name="product" defaultValue={initialProduct} placeholder="Название или обозначение" required /></label>
        <label><span>Количество <b>*</b></span><input name="quantity" inputMode="numeric" type="number" min="1" placeholder="Штук" required /></label>
      </div>
      <label><span>Комментарий <b>*</b></span><textarea name="comment" rows={4} placeholder="Размеры, сроки, особенности проекта" required /></label>
      <label className="file-input"><span>Приложить чертёж или ТЗ</span><span className="file-picker"><span className="file-picker-action">Выбрать файл <b aria-hidden="true">＋</b></span><span className="file-picker-name">{fileName || "PDF, DWG, DXF, JPG или PNG"}</span></span><input className="file-native" name="attachment" type="file" accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /></label>
      <label className="consent"><input type="checkbox" required /> <span>Согласен на обработку персональных данных для ответа на заявку. <a href="https://uzmzavod.ru/privacy-policy/" target="_blank" rel="noreferrer">Политика конфиденциальности</a>.</span></label>
      <div className="form-actions"><button className="button button-primary" type="submit">Проверить данные <span aria-hidden>↗</span></button></div>
    </form>
  );
}
