import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "..", ".env.local"), "utf8").split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Show all members
const { data: members } = await admin.from("members").select("*");
console.log(`Members table has ${members?.length ?? 0} rows:`);
for (const m of (members ?? [])) {
  console.log(`  ${m.email} | role=${m.role} | user_id=${m.user_id}`);
}

// Show all auth users
const { data: userList } = await admin.auth.admin.listUsers();
console.log(`\nAuth users (${userList?.users?.length ?? 0}):`);
for (const u of (userList?.users ?? [])) {
  console.log(`  ${u.email} | id=${u.id} | confirmed=${u.email_confirmed_at ? "yes" : "no"}`);
}

// Clean up: delete all members whose auth user no longer exists, plus all test members
const authIds = new Set((userList?.users ?? []).map((u) => u.id));
const orphaned = (members ?? []).filter((m) => !authIds.has(m.user_id));
console.log(`\nOrphaned member rows (auth user deleted but member remains): ${orphaned.length}`);
for (const o of orphaned) {
  console.log(`  deleting: ${o.email}`);
  await admin.from("members").delete().eq("id", o.id);
}

// Also delete test members that still have auth users
for (const m of (members ?? [])) {
  if (m.email.includes("test+") || m.email.includes("@example.com")) {
    console.log(`  deleting test member: ${m.email}`);
    await admin.from("members").delete().eq("id", m.id);
    const authUser = (userList?.users ?? []).find((u) => u.id === m.user_id);
    if (authUser) {
      await admin.auth.admin.deleteUser(authUser.id);
      console.log(`    deleted auth user too`);
    }
  }
}

// Verify clean
const { data: remaining } = await admin.from("members").select("email, role");
console.log(`\nRemaining members: ${remaining?.length ?? 0}`);
for (const m of (remaining ?? [])) console.log(`  ${m.email} | ${m.role}`);
