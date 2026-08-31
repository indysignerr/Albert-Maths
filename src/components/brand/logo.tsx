import { cn } from "@/lib/utils";

/**
 * The Albert mark: a gradient sphere with a small solid dot on its left edge.
 * Redrawn as vector so it stays crisp and can be recoloured per theme.
 */
export function AlbertMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Albert Maths"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="albert-sphere" x1="18%" y1="12%" x2="82%" y2="88%">
          <stop offset="0%" stopColor="#2EAEE0" />
          <stop offset="55%" stopColor="#74BEEA" />
          <stop offset="100%" stopColor="#CFE8F7" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="32" r="24" fill="url(#albert-sphere)" />
      <circle cx="12" cy="32" r="7" className="fill-navy-800 dark:fill-white" />
    </svg>
  );
}

export function AlbertWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span className="font-display text-[1.05em] font-bold tracking-tight">
        ALBERT
      </span>
      <span className="font-display text-[1.05em] font-extralight tracking-[0.18em]">
        MATHS
      </span>
    </span>
  );
}

/**
 * The wordmark is dropped below 640px. At 375 it left no room for the theme
 * toggle and the sign-in button, and the header overflowed the viewport by 29px;
 * the mark on its own is still recognisably Albert.
 */
export function AlbertLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <AlbertMark className="h-7 w-7 shrink-0" />
      <AlbertWordmark className="hidden sm:flex" />
    </span>
  );
}
