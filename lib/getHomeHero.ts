import { supabase } from "@/lib/supabaseClient";

export async function getHomeHero() {
  const { data, error } = await supabase
    .from("home_hero")
    .select("*")
    .eq("id", 1)
    .limit(1);

  if (error) {
    console.error("Fetch home_hero error:", error.message);
    return null;
  }

  return data?.[0] ?? null;
}