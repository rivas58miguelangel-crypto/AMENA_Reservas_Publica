import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (import.meta.env.DEV) {
  console.info("[AMENA Supabase ENV]", {
    hasUrl: Boolean(supabaseUrl),
    urlStartsWithHttps: supabaseUrl?.startsWith("https://"),
    urlContainsRestV1: supabaseUrl?.includes("/rest/v1"),
    hasAnonKey: Boolean(supabaseAnonKey),
    anonKeyStartsWithPublishable: supabaseAnonKey?.startsWith("sb_publishable_"),
    anonKeyLength: supabaseAnonKey?.length ?? 0,
  });
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;