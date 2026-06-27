import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { parentSignOut } from "./actions";
import { PinGate } from "@/components/parent/pin-gate";
import { Dashboard } from "@/components/parent/dashboard";
import { Button } from "@/components/ui/button";
import { PIN_OK_COOKIE } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { contentThemeIds } from "@/data/themes/content";
import { THEMES } from "@/data/themes";
import {
  summarize,
  type AttemptRow,
  type ChildRow,
  type EarnedStickerRow,
  type HutProgressRow,
  type SkillLevelRow,
  type ThemeMasteryRow,
} from "@/lib/parent/dashboard-data";
import { vi } from "@/i18n";

const t = vi.parent;

// Gated parent landing. Order: must be signed in (middleware + here), then must
// pass the PIN (setup the first time, enter thereafter). Real dashboard = task 24.
export default async function ParentHomePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/parent/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/parent/login");

  const pinOk = (await cookies()).has(PIN_OK_COOKIE);
  if (!pinOk) {
    const { data } = await supabase.from("parents").select("pin_hash").eq("id", user.id).single();
    return <PinGate mode={data?.pin_hash ? "enter" : "setup"} />;
  }

  // RLS scopes every table to this parent's children, so unfiltered selects are
  // already per-parent.
  const [children, skillLevels, hutProgress, themeMastery, earnedStickers, attempts] = await Promise.all([
    supabase.from("children").select("id, name, avatar, sticker_set"),
    supabase.from("child_skill_levels").select("child_id, skill, level"),
    supabase.from("hut_progress").select("child_id, theme_id, skill, completed, mastered"),
    supabase.from("theme_mastery").select("child_id, theme_id"),
    supabase.from("earned_stickers").select("child_id, sticker_id, seq").order("seq"),
    supabase.from("learning_attempts").select("child_id, hut_id, first_try_correct"),
  ]);

  const themeIds = new Set(contentThemeIds());
  const data = summarize({
    children: (children.data ?? []) as ChildRow[],
    skillLevels: (skillLevels.data ?? []) as SkillLevelRow[],
    hutProgress: (hutProgress.data ?? []) as HutProgressRow[],
    themeMastery: (themeMastery.data ?? []) as ThemeMasteryRow[],
    earnedStickers: (earnedStickers.data ?? []) as EarnedStickerRow[],
    attempts: (attempts.data ?? []) as AttemptRow[],
    themes: THEMES.filter((th) => themeIds.has(th.id)).map((th) => ({ id: th.id, title: th.title })),
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{t.dashboard.title}</h1>
      </header>

      <Dashboard data={data} />

      <div className="flex flex-col items-center gap-4 border-t border-border-soft pt-5">
        <form action={parentSignOut}>
          <Button type="submit" variant="secondary">
            {t.signOut}
          </Button>
        </form>
        <Link href="/" className="text-ink-muted underline-offset-4 hover:underline">
          {t.backToKids}
        </Link>
      </div>
    </div>
  );
}
