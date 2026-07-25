// End-to-end test of the critical path:
//   1. Sign up Vanessa (first user → admin via trigger)
//   2. Sign in as Vanessa
//   3. Drop a clip (TikTok link)
//   4. Verify it appears in clips_with_meta (Run Sheet query)
//   5. Sign up Maria (second user → member)
//   6. Vanessa tags Maria in the clip (clip_people + approval row)
//   7. Verify Maria's approval is "Waiting"
//   8. Maria approves it ("Approved")
//   9. Verify approval status changed
//  10. Verify RLS: Maria cannot delete Vanessa's clip
//  11. Verify RLS: Maria cannot approve a clip she's NOT tagged in
//
// Uses the anon key (like the browser would) so RLS is enforced.
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

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const stamp = Date.now();
const vanessaEmail = `vanessa.test+${stamp}@gmail.com`;
const mariaEmail = `maria.test+${stamp}@gmail.com`;
const password = "TestPass123!";

function anonClient(token) {
  return createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
}

async function main() {
  console.log("\n=== AZ Off Script — Critical Path Test ===\n");

  // Pre-clean: remove any leftover test members from previous runs
  const preClean = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
  // Delete all test members (any email containing "test+")
  await preClean.from("members").delete().like("email", "%test+%");
  // Also delete any orphaned auth users with test emails
  const { data: userList } = await preClean.auth.admin.listUsers();
  for (const u of (userList?.users ?? [])) {
    if (u.email && u.email.includes("test+")) {
      await preClean.auth.admin.deleteUser(u.id);
    }
  }

  // --- 1. Create Vanessa (admin) via admin API (bypasses rate limits) ---
  console.log("1. Create Vanessa (first user → should become admin via trigger)...");
  const adminAuth = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: vUser, error: vErr } = await adminAuth.auth.admin.createUser({
    email: vanessaEmail,
    password,
    email_confirm: true,
    user_metadata: { name: "Vanessa" },
  });
  if (vErr) { console.log("   CREATE ERROR:", vErr.message); return; }
  check("Vanessa user created", !!vUser.user, vErr?.message);

  // Sign in as Vanessa to get a session token (RLS-enforced queries)
  const vanessaAuth = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: vSignin, error: vSigninErr } = await vanessaAuth.auth.signInWithPassword({ email: vanessaEmail, password });
  check("Vanessa signed in", !!vSignin.session, vSigninErr?.message);
  const vToken = vSignin.session?.access_token;
  const vanessa = anonClient(vToken);

  // Get Vanessa's member row (created by handle_new_user trigger)
  const { data: vMember } = await vanessa.from("members").select("*").eq("email", vanessaEmail).single();
  check("Vanessa member row exists (trigger fired)", !!vMember);
  check("Vanessa is admin (first user)", vMember?.role === "admin", `got role: ${vMember?.role}`);

  // --- 2. Create Maria (member) ---
  console.log("\n2. Create Maria (second user → should become member)...");
  const { data: mUser, error: mErr } = await adminAuth.auth.admin.createUser({
    email: mariaEmail,
    password,
    email_confirm: true,
    user_metadata: { name: "Maria" },
  });
  check("Maria user created", !!mUser.user, mErr?.message);

  const mariaAuth = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: mSignin } = await mariaAuth.auth.signInWithPassword({ email: mariaEmail, password });
  check("Maria signed in", !!mSignin.session);
  const mToken = mSignin.session?.access_token;
  const maria = anonClient(mToken);

  const { data: mMember } = await maria.from("members").select("*").eq("email", mariaEmail).single();
  check("Maria member row exists (trigger fired)", !!mMember);
  check("Maria is member (not admin)", mMember?.role === "member", `got role: ${mMember?.role}`);

  // --- 3. Vanessa drops a clip ---
  console.log("\n3. Vanessa drops a TikTok link clip...");
  const { data: clip, error: clipErr } = await vanessa.from("clips").insert({
    title: "Red Flag or Real Life? — First Wave",
    type: "tiktok_link",
    link: "https://www.tiktok.com/@test/video/1234567890",
    submitted_by: vMember.id,
    submitted_by_name: "Vanessa",
  }).select().single();
  check("Clip dropped", !!clip, clipErr?.message);
  check("Clip status is 'Dropped'", clip?.status === "Dropped", `got: ${clip?.status}`);

  // --- 4. Verify it appears in Run Sheet query (clips_with_meta view) ---
  console.log("\n4. Verify clip appears in Run Sheet (clips_with_meta)...");
  const { data: meta, error: metaErr } = await vanessa.from("clips_with_meta").select("*").eq("id", clip.id).single();
  check("Clip visible in Run Sheet view", !!meta, metaErr?.message);
  check("Clip title correct in view", meta?.title === "Red Flag or Real Life? — First Wave");

  // --- 5. Vanessa tags Maria in the clip ---
  console.log("\n5. Vanessa tags Maria in the clip...");
  const { error: pplErr } = await vanessa.from("clip_people").insert({
    clip_id: clip.id,
    member_id: mMember.id,
    member_name: "Maria",
  });
  check("Maria tagged in clip", !pplErr, pplErr?.message);

  const { error: appErr } = await vanessa.from("approvals").insert({
    clip_id: clip.id,
    member_id: mMember.id,
    member_name: "Maria",
    status: "Waiting",
  });
  check("Maria's approval row created (Waiting)", !appErr, appErr?.message);

  // --- 6. Verify Maria's approval is Waiting ---
  console.log("\n6. Verify Maria's approval status...");
  const { data: approval } = await maria.from("approvals").select("*").eq("clip_id", clip.id).eq("member_id", mMember.id).single();
  check("Maria sees her approval", !!approval);
  check("Maria's approval is 'Waiting'", approval?.status === "Waiting", `got: ${approval?.status}`);

  // --- 7. Maria approves the clip ---
  console.log("\n7. Maria approves the clip...");
  const { error: approveErr } = await maria.from("approvals").update({ status: "Approved" }).eq("id", approval.id);
  check("Maria approved the clip", !approveErr, approveErr?.message);

  const { data: updatedApproval } = await maria.from("approvals").select("*").eq("id", approval.id).single();
  check("Approval status is now 'Approved'", updatedApproval?.status === "Approved", `got: ${updatedApproval?.status}`);

  // --- 8. Verify the Run Sheet view reflects the approval ---
  console.log("\n8. Verify Run Sheet view reflects approval...");
  const { data: finalMeta } = await vanessa.from("clips_with_meta").select("*").eq("id", clip.id).single();
  check("Run Sheet shows 1 approval total", finalMeta?.approvals_total === 1, `got: ${finalMeta?.approvals_total}`);
  check("Run Sheet shows 1 approved", finalMeta?.approvals_approved === 1, `got: ${finalMeta?.approvals_approved}`);
  check("Run Sheet shows 0 waiting", finalMeta?.approvals_waiting === 0, `got: ${finalMeta?.approvals_waiting}`);

  // --- 9. RLS: Maria cannot delete Vanessa's clip ---
  console.log("\n9. RLS edge cases...");
  const { error: delErr } = await maria.from("clips").delete().eq("id", clip.id);
  // RLS silently filters — no error, but 0 rows affected. Verify clip still exists.
  const { data: clipStillExists } = await vanessa.from("clips").select("id").eq("id", clip.id).single();
  check("Maria CANNOT delete Vanessa's clip (RLS blocks)", !!clipStillExists, delErr?.message || "clip was deleted (BAD)");

  // --- 10. RLS: Maria cannot approve a clip she's NOT tagged in ---
  // Create a second clip by Vanessa, don't tag Maria, try to approve
  const { data: clip2 } = await vanessa.from("clips").insert({
    title: "Untagged test clip",
    type: "idea",
    idea_text: "test",
    submitted_by: vMember.id,
    submitted_by_name: "Vanessa",
  }).select().single();
  const { error: rogueApproveErr } = await maria.from("approvals").insert({
    clip_id: clip2.id,
    member_id: mMember.id,
    member_name: "Maria",
    status: "Approved",
  });
  check("Maria CANNOT approve clip she's not tagged in (RLS blocks)", !!rogueApproveErr, rogueApproveErr?.message || "insert succeeded (BAD)");

  // --- 11. Admin can change clip status ---
  console.log("\n10. Admin status control...");
  const { error: statusErr } = await vanessa.from("clips").update({ status: "Review" }).eq("id", clip.id);
  check("Vanessa (admin) can move clip to Review", !statusErr, statusErr?.message);

  // --- 12. Member cannot change clip status ---
  const beforeStatus = (await vanessa.from("clips").select("status").eq("id", clip.id).single())?.data?.status;
  const { error: memberStatusErr } = await maria.from("clips").update({ status: "Ready" }).eq("id", clip.id);
  const afterStatus = (await vanessa.from("clips").select("status").eq("id", clip.id).single())?.data?.status;
  check("Maria (member) CANNOT change clip status (RLS blocks)", afterStatus === beforeStatus, `status changed from ${beforeStatus} to ${afterStatus} (BAD)`);

  // --- Cleanup ---
  console.log("\nCleaning up test data...");
  await adminAuth.from("clips").delete().in("id", [clip.id, clip2?.id].filter(Boolean));
  await adminAuth.from("members").delete().in("user_id", [vUser.user.id, mUser.user.id].filter(Boolean));
  await adminAuth.auth.admin.deleteUser(vUser.user.id);
  await adminAuth.auth.admin.deleteUser(mUser.user.id);
  // Also clean up any leftover member rows from previous failed runs
  await adminAuth.from("members").delete().like("email", "%@example.com").ilike("email", "%test+%");
  console.log("  cleaned up test users + clips + member rows");

  // --- Summary ---
  console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===\n`);
  if (fail > 0) { console.log("❌ Some checks failed. Review above."); process.exit(1); }
  else { console.log("✅ Critical path fully verified. The machine works."); process.exit(0); }
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
