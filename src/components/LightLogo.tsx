export function LightLogo({ className = "", id }: { className?: string; id: string }) {
  return <svg className={className} viewBox="0 0 2015 1189" role="img" aria-label="УЗМ Завод"><defs><filter id={id}><feComponentTransfer><feFuncA type="linear" slope="4" /></feComponentTransfer></filter></defs><image href="/images/logo.webp" width="2015" height="1189" filter={`url(#${id})`} /></svg>;
}
