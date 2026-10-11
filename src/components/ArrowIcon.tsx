type ArrowIconProps = {
  direction?: "up-right" | "right" | "down";
  className?: string;
};

export function ArrowIcon({ direction = "up-right", className }: ArrowIconProps) {
  const path = direction === "down"
    ? <path d="M12 4v15m0 0 6-6m-6 6-6-6" />
    : direction === "right"
      ? <path d="M4 12h15m0 0-6-6m6 6-6 6" />
      : <path d="M5 19 19 5M8 5h11v11" />;

  return (
    <svg
      aria-hidden="true"
      className={className ? `arrow-icon ${className}` : "arrow-icon"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {path}
    </svg>
  );
}
