import Link from "next/link";

export default function NotFound() { return <div className="container not-found"><span className="eyebrow">404</span><h1>Страница не найдена</h1><p>Возможно, адрес изменился. Вернитесь в каталог и выберите нужную группу.</p><Link href="/catalog" className="button button-primary">Перейти в каталог <span aria-hidden>↗</span></Link></div>; }
