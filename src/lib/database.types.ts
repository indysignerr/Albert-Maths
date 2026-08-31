export type AppRole = "student" | "teacher" | "admin";
export type Campus = "paris" | "milan" | "madrid" | "geneva" | "marseille";
export type Track = "english" | "french";
export type MsgAuthor = "student" | "tutor";

export type Profile = {
  id: string;
  first_name: string;
  last_initial: string;
  role: AppRole;
  campus: Campus | null;
  cohort: string | null;
  track: Track | null;
  ui_locale: string;
  onboarded_at: string | null;
  created_at: string;
};

export type ClassRow = {
  id: string;
  name: string;
  campus: Campus;
  cohort: string;
  subject: string;
  invite_code: string;
  created_by: string | null;
  created_at: string;
};

export type Problem = {
  id: string;
  owner_id: string;
  subject: string;
  topic: string | null;
  source_lang: string | null;
  statement_latex: string | null;
  statement_plain: string | null;
  created_at: string;
};

export type HintReveal = {
  problem_id: string;
  profile_id: string;
  level: 1 | 2 | 3 | 4;
  revealed_at: string;
};

export type Attempt = {
  id: string;
  problem_id: string;
  profile_id: string;
  body: string;
  error_step: string | null;
  is_correct: boolean | null;
  created_at: string;
};

export type TutorMessage = {
  id: string;
  problem_id: string;
  profile_id: string;
  author: MsgAuthor;
  content: string;
  created_at: string;
};

export type ProgressEvent = {
  id: string;
  profile_id: string;
  kind: "error_understood" | "consolidation_passed";
  problem_id: string | null;
  created_at: string;
};

export type ChannelMessage = {
  id: string;
  class_id: string;
  profile_id: string;
  content: string;
  problem_id: string | null;
  hidden_at: string | null;
  created_at: string;
};

/**
 * Hand-written until the schema settles, then replaced by
 * `supabase gen types typescript`. `Relationships` is required by postgrest-js:
 * omit it and the whole schema silently degrades to `never`, which surfaces as
 * "not assignable to parameter of type 'never'" on the first .update() call.
 */
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile>;
      classes: Table<ClassRow>;
      problems: Table<Problem>;
      hint_reveals: Table<HintReveal>;
      attempts: Table<Attempt>;
      tutor_messages: Table<TutorMessage>;
      progress_events: Table<ProgressEvent>;
      channel_messages: Table<ChannelMessage>;
    };
    Views: Record<string, never>;
    Functions: {
      join_class: { Args: { code: string }; Returns: string };
      create_class: {
        Args: { name: string; campus: Campus; cohort: string };
        Returns: ClassRow;
      };
      class_member_count: { Args: { target_class: string }; Returns: number };
      problems_today: { Args: Record<string, never>; Returns: number };
      daily_problem_limit: { Args: Record<string, never>; Returns: number };
      delete_own_account: { Args: Record<string, never>; Returns: null };
      export_own_data: { Args: Record<string, never>; Returns: unknown };
    };
    Enums: {
      app_role: AppRole;
      campus: Campus;
      track: Track;
      msg_author: MsgAuthor;
    };
    CompositeTypes: Record<string, never>;
  };
}

export const CAMPUSES: { value: Campus; label: string }[] = [
  { value: "paris", label: "Paris" },
  { value: "milan", label: "Milan" },
  { value: "madrid", label: "Madrid" },
  { value: "geneva", label: "Geneva" },
  { value: "marseille", label: "Marseille" },
];

export const TRACKS: { value: Track; label: string; locale: string }[] = [
  { value: "english", label: "English track", locale: "en" },
  { value: "french", label: "French track", locale: "fr" },
];
