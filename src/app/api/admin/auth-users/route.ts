import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/auth-users
 *
 * Returns every auth user with their login activity. Admin-only.
 *
 * The browser can't query auth.users directly (RLS on the auth schema blocks
 * the anon key), so this route uses the service role's
 * supabase.auth.admin.listUsers() to pull the data server-side.
 *
 * Response: {
 *   users: [{
 *     id, email, created_at, last_sign_in_at, email_confirmed_at,
 *     has_member_row: boolean, member_name: string | null
 *   }]
 * }
 */
export async function GET() {
  try {
    // 1. Verify the caller is authenticated + admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: caller } = await supabase
      .from("members")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // 2. Pull all auth users via the service role admin API
    const service = createServiceClient();

    // listUsers returns up to 1000 per page; page through if needed.
    const users: Array<{
      id: string;
      email: string | null;
      created_at: string;
      last_sign_in_at: string | null;
      email_confirmed_at: string | null;
    }> = [];

    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await service.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!data.users || data.users.length === 0) break;
      for (const u of data.users) {
        users.push({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
        });
      }
      if (data.users.length < 1000) break; // last page
      page += 1;
      // Safety cap — never loop forever
      if (page > 50) break;
    }

    // 3. Pull the members table so we can flag who has a crew profile
    const { data: members } = await service
      .from("members")
      .select("user_id, name");

    const memberByUserId = new Map<string, string>();
    for (const m of members ?? []) {
      if (m.user_id) memberByUserId.set(m.user_id, m.name);
    }

    // 4. Merge + sort: most recent activity first
    const merged = users
      .map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        has_member_row: memberByUserId.has(u.id),
        member_name: memberByUserId.get(u.id) ?? null,
      }))
      .sort((a, b) => {
        const aTime = a.last_sign_in_at ?? a.created_at;
        const bTime = b.last_sign_in_at ?? b.created_at;
        return bTime.localeCompare(aTime);
      });

    return NextResponse.json({ users: merged });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
