import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/agreements/whoami
 *
 * Returns the current user's session info + IP address for the pre-sign
 * disclosure. This lets us show the participant:
 *   "You are signing as Vanessa (vanessa@example.com) from IP 73.x.x.x on Chrome/Windows"
 * BEFORE they sign, so they acknowledge what's being recorded.
 *
 * This is for legal protection — it proves the participant saw and acknowledged
 * the device/IP they were signing from.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("members")
      .select("id, name, email, role")
      .eq("id", user.id)
      .maybeSingle();

    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? null;

    return NextResponse.json({
      authenticated: true,
      memberId: member?.id ?? user.id,
      name: member?.name ?? user.email,
      email: member?.email ?? user.email,
      role: member?.role ?? "unknown",
      emailVerified: !!user.email_confirmed_at,
      ip,
      userAgent,
      deviceSummary: summarizeDevice(userAgent),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function summarizeDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isIPad = /iPad/i.test(ua);
  const isIPhone = /iPhone/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);
  const isEdge = /Edg/i.test(ua);

  const browser = isEdge ? "Edge" : isChrome ? "Chrome" : isSafari ? "Safari" : isFirefox ? "Firefox" : "Browser";
  const os = isIPad ? "iPad" : isIPhone ? "iPhone" : isAndroid ? "Android" : isMac ? "Mac" : isWindows ? "Windows" : "Device";
  return `${browser} on ${os}${isMobile && !isIPad && !isIPhone ? " (mobile)" : ""}`;
}
