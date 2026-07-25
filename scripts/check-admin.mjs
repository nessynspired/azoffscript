// Quick check: verify Vanessa's admin account exists in Supabase
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  // Check members table for Vanessa
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .ilike("name", "%ness%")
    .or("email.ilike.%nessynspired%");

  if (error) {
    console.log("Query error:", error.message);
  }

  if (!data || data.length === 0) {
    // Try broader search
    const { data: all } = await supabase.from("members").select("*").limit(10);
    console.log("No match for 'ness' — all members in DB:");
    console.log(JSON.stringify(all, null, 2));
  } else {
    console.log("Found your account:");
    console.log(JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
