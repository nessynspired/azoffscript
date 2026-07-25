import { NextResponse } from "next/server";

/**
 * Returns the VAPID public key so the client can subscribe to push.
 * The private key is never exposed to the client.
 */
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
  }
  return NextResponse.json({ publicKey });
}
