// Apply supabase/add-drop-purpose.sql using supabase-js service client.
// Tries multiple approaches to run DDL SQL.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");

if (!existsSync(envPath)) {
  console.error("Missing .env.local at", envPath);
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// The SQL is split into statements. We can't run DDL via rpc easily,
// but we CAN use the PostgREST endpoint to check if the column exists
// and the supabase-js from() to see if it's already there.
// For DDL, we need to use the database/query endpoint.

function decodeJwt(token) {
  const payload = token.split(".")[1];
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64url").toString("utf8"));
}

const claims = decodeJwt(serviceKey);
const projectRef = claims.ref;

// Try the Supabase SQL endpoint at /rest/v1/rpc or the database/query
// The newer Supabase projects support POST /database/query
async function tryDatabaseQuery() {
  // Try the supabase.co database/query endpoint
  const endpoints = [
    `https://${projectRef}.supabase.co/database/query`,
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    `${url}/rest/v1/rpc`,
  ];

  const sql = readFileSync(resolve(__dirname, "..", "supabase", "add-drop-purpose.sql"), "utf8");

  for (const endpoint of endpoints) {
    console.log(`\n→ Trying ${endpoint}`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      if (res.ok) {
        console.log(`✓ Success (${res.status}): ${text.slice(0, 200)}`);
        return true;
      }
      console.log(`  ${res.status}: ${text.slice(0, 300)}`);
    } catch (e) {
      console.log(`  error: ${e?.message ?? e}`);
    }
  }
  return false;
}

// Check if the column already exists by trying to select it
async function checkColumnExists() {
  const { data, error } = await sb
    .from("clips")
    .select("id, drop_purpose")
    .limit(1);
  if (error) {
    console.log("\nColumn drop_purpose does not exist yet:", error.message);
    return false;
  }
  console.log("\n✓ Column drop_purpose already exists!");
  console.log("Sample:", data);
  return true;
}

async function main() {
  // First check if it's already there
  const exists = await checkColumnExists();
  if (exists) {
    console.log("\nMigration already applied. Nothing to do.");
    return;
  }

  console.log("\nAttempting to run migration...");
  const ok = await tryDatabaseQuery();
  if (!ok) {
    console.error("\n❌ Could not apply migration automatically.");
    console.error("\nManual steps:");
    console.error("  1. Open Supabase Dashboard → SQL Editor");
    console.error("  2. Paste contents of supabase/add-drop-purpose.sql");
    console.error("  3. Run");
    process.exit(2);
  }
}

main();
