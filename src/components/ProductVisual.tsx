type Props = { variant?: "pole" | "mast" | "structure"; className?: string };

export function ProductVisual({ variant = "pole", className = "" }: Props) {
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
