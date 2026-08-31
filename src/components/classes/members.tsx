"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";
import type { ClassRow, Profile } from "@/lib/database.types";

/** "Léa M." — enough to be accountable, not enough to be a directory. */
function displayName(p: Pick<Profile, "first_name" | "last_initial">) {
  return p.last_initial ? `${p.first_name} ${p.last_initial}.` : p.first_name;
}

export function ClassMembers({ classRow }: { classRow: ClassRow }) {
  const { session } = useAuth();
  const { t } = useT();
  const [members, setMembers] = useState<Profile[]>([]);

  const load = useCallback(async () => {
    // Two queries rather than a join: the policies allow reading memberships of
    // a class you belong to, and profiles of people you share a class with, and
    // postgrest resolves those separately.
    const { data: rows } = await supabase
      .from("class_members")
      .select("profile_id")
      .eq("class_id", classRow.id);
    if (!rows?.length) return;

    const { data: people } = await supabase
      .from("profiles")
      .select("*")
      .in(
        "id",
        rows.map((r) => r.profile_id),
      );
    setMembers(people ?? []);
  }, [classRow.id]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  if (!members.length) return null;

  return (
    <details className="border-b border-border">
      <summary className="flex h-12 cursor-pointer items-center gap-2 px-5 text-sm text-text-muted hover:text-text">
        <Users className="size-4" aria-hidden />
        {t("classes.memberList")}
        <span className="ml-auto tabular-nums text-text-faint">
          {members.length}
        </span>
      </summary>
      <ul className="flex flex-wrap gap-2 px-5 pb-4">
        {members.map((m) => (
          <li
            key={m.id}
            className="rounded-full border border-border px-3 py-1 text-sm text-text-muted"
          >
            {displayName(m)}
            {m.id === session?.user.id && (
              <span className="text-text-faint"> · {t("classes.you")}</span>
            )}
            {m.id === classRow.created_by && m.id !== session?.user.id && (
              <span className="text-text-faint"> · {t("classes.founder")}</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
