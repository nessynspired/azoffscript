// Apply supabase/schema.sql to the configured Supabase project.
// Strategy: use the database REST endpoint that supabase-js exposes via
// the service-role client's `rpc` is not enough for DDL, so we use the
// pg-gateway SQL endpoint at <project>.supabase.co/rest/v1/ is also not
// for DDL. The reliable path is the Supabase SQL over HTTP endpoint:
//   POST https://<project>.supabase.co/pg/query  (newer projects)
// or via the database connection directly using postgres protocol.
//
// Since neither CLI nor pg endpoint is guaranteed, we use the
// `@supabase/supabase-js` service client to run the SQL through a
// stored-procedure shim is not possible for DDL either.
//
// FINAL RELIABLE APPROACH: connect to the Postgres database directly
// using the `pg` library over the connection string Supabase exposes.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Decode the JWT to find the project ref
function decodeJwt(token) {
  const payload = token.split(".")[1];
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64url").toString("utf8"));
}

const claims = decodeJwt(serviceKey);
const projectRef = claims.ref;
console.log("Project ref:", projectRef);

const sql = readFileSync(resolve(__dirname, "..", "supabase", "schema.sql"), "utf8");

// Use the Supabase Management API SQL endpoint:
// POST https://api.supabase.com/v1/projects/{ref}/database/query
// This requires the service role key as bearer.
// Fallback: the database direct connection via pg.

async function tryManagementApi() {
  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  console.log(`\n→ POST ${endpoint}`);
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
      console.log(`✓ Schema applied via Management API (${res.status})`);
      return true;
    }
    console.log(`  status ${res.status}: ${text.slice(0, 500)}`);
    return false;
  } catch (e) {
    console.log(`  error: ${e?.message ?? e}`);
    return false;
  }
}

async function tryPgEndpoint() {
  const endpoint = `${url}/pg/query`;
  console.log(`\n→ POST ${endpoint}`);
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
      console.log(`✓ Schema applied via /pg/query (${res.status})`);
      return true;
    }
    console.log(`  status ${res.status}: ${text.slice(0, 500)}`);
    return false;
  } catch (e) {
    console.log(`  error: ${e?.message ?? e}`);
    return false;
  }
}

// Try the REST SQL function approach: create a function that runs arbitrary SQL
// is not safe. Instead, split the schema into individual statements and run
// them via rpc to a helper. But we can't create the helper without running DDL...
//
// The cleanest fallback that works on every Supabase project: use the
// database pooler connection string with the `pg` library.
async function tryPgLib() {
  console.log("\n→ Trying direct Postgres connection via pg library...");
  try {
    const { default: pg } = await import("pg");
    // Connection string format: postgresql://postgres.<ref>:<password>@<host>:5432/postgres
    // We don't have the DB password from env. This won't work without it.
    console.log("  Cannot use pg without a DB password in .env.local.");
    return false;
  } catch (e) {
    console.log("  pg library not available:", e?.message ?? e);
    return false;
  }
}

async function main() {
  if (await tryManagementApi()) return;
  if (await tryPgEndpoint()) return;
  await tryPgLib();

  console.error("\n❌ Could not apply schema automatically.");
  console.error("\nManual steps:");
  console.error("  1. Open your Supabase Dashboard");
  console.error(`  2. Project: ${projectRef}`);
  console.error("  3. SQL Editor → New query");
  console.error("  4. Paste the contents of supabase/schema.sql");
  console.error("  5. Run");
  console.error("\nThen re-run the dev server. The app will work once the schema exists.");
  process.exit(2);
}

main();
