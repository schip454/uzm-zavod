import type { VisualKind } from "@/data/catalog";
type Props = { variant?: VisualKind; className?: string };

export function ProductVisual({ variant = "pole", className = "" }: Props) {
  const paths: Partial<Record<VisualKind, { label: string; path: string }>> = {
    bracket: { label: "Схема кронштейна", path: "M100 260V120Q100 78 142 78H247M92 260H108M142 78V92M247 78V92M234 92H260" },
    foundation: { label: "Схема закладной детали", path: "M94 78H226V96H94ZM127 96V259H193V96M135 126H185M135 226H185M113 78V62M207 78V62M109 58H117M203 58H211" },
    pile: { label: "Схема сваи", path: "M146 44H174V241L160 280L146 241ZM114 223Q160 188 206 223Q160 256 114 223ZM138 44H182" },
    pipe: { label: "Схема трубы и опоры", path: "M56 118H264M56 174H264M56 118C30 118 30 174 56 174C80 174 80 118 56 118ZM125 177V222H195V177M105 223H215V236H105Z" },
    base: { label: "Схема цоколя", path: "M138 68H182L230 243H90ZM138 68Q160 80 182 68M90 243Q160 263 230 243M160 80V250M139 178H155V216H129Z" },
    luminaire: { label: "Схема светильника", path: "M160 65C102 65 95 138 125 161L140 175H180L195 161C225 138 218 65 160 65ZM125 161H195M141 175V197H179V175M148 197V252H172V197M135 252H185" },
    frame: { label: "Схема рамной конструкции", path: "M60 260V80H260V260M76 260V96H244V260M60 80L76 96M95 80L120 96L145 80L170 96L195 80L220 96L245 80M60 120L76 145L60 170L76 195L60 220L76 245M244 120L260 145L244 170L260 195L244 220L260 245" },
  };
  const drawing = paths[variant];
  if (drawing) return <svg className={className} viewBox="0 0 320 320" role="img" aria-label={drawing.label} fill="none"><path d={drawing.path} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/><path d="M45 284H275" stroke="currentColor" opacity=".3"/></svg>;
  if (variant === "structure") {
    return (
      <svg className={className} viewBox="0 0 320 320" role="img" aria-label="Схема металлоконструкции" fill="none">
        <path d="M38 242H286M53 237V109L160 58L269 109V237" stroke="currentColor" strokeWidth="5" />
        <path d="M53 109H269M76 237V111M160 237V59M246 237V111M77 110L160 237L246 110M77 237L160 111L246 237" stroke="currentColor" strokeWidth="2.4" opacity=".45" />
        <path d="M31 260H290M31 269H290" stroke="currentColor" opacity=".35" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 320 320" role="img" aria-label={variant === "mast" ? "Схема мачты освещения" : "Схема опоры освещения"} fill="none">
      <path d="M160 53L153 255H167L160 53Z" fill="currentColor" opacity=".11" stroke="currentColor" strokeWidth="2.7" />
      <path d="M160 54V40M160 58L111 63M160 58L209 63M111 63L103 75M209 63L217 75M97 75H117M203 75H223" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {variant === "mast" && <path d="M137 91H183M132 126H188M128 162H192M122 198H198" stroke="currentColor" strokeWidth="2" opacity=".55" />}
      <path d="M137 255H183V263H137V255ZM114 263H206M122 271H198" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M58 281H262M67 290H253" stroke="currentColor" opacity=".35" />
    </svg>
  );
}
