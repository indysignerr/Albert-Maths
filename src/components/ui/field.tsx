"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, className, ...props }: FieldProps) {
  const { t } = useT();
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = props.type === "password";
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          // Toggling `type` on one input, rather than swapping two, keeps the
          // value and the password manager's association with the field intact.
          type={isPassword && revealed ? "text" : props.type}
          id={id}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-text placeholder:text-text-faint",
            isPassword && "pr-12",
            error && "border-[var(--color-danger)]",
            className,
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={t(revealed ? "auth.hidePassword" : "auth.showPassword")}
            aria-pressed={revealed}
            // Not a tab stop: someone moving through the form with the keyboard
            // wants the submit button next, not a control they did not ask for.
            tabIndex={-1}
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-text-faint transition-colors hover:text-text"
          >
            {revealed ? (
              <EyeOff className="size-[18px]" aria-hidden />
            ) : (
              <Eye className="size-[18px]" aria-hidden />
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
