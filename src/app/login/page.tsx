"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/portal/lobby");
        router.refresh();
      } else {
        // sign up: requires a valid invite code
        if (!inviteCode.trim()) {
          setError("You need an invite code to join. Ask Vanessa for one.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, invite_code: inviteCode.trim() } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setError("Check your email for a confirmation link, then come back and sign in.");
          setMode("signin");
        } else if (data.session) {
          router.push("/portal/lobby");
          router.refresh();
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // friendly error mapping per DESIGNSPEC §14
      if (msg.toLowerCase().includes("invalid login")) {
        setError("Looks like that login did not hit. Try again or message Vanessa.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* sunburst accent behind mascot */}
      <div className="absolute left-[8%] top-[12%] w-72 h-72 tex-sunburst opacity-20 animate-spin-slow rounded-full" aria-hidden />
      <div className="absolute right-[6%] bottom-[8%] w-48 h-48 tex-sunburst opacity-10 animate-spin-slow rounded-full" aria-hidden />

      <div className="relative w-full max-w-md">
        {/* mascot peeking behind card — real transparent PNG */}
        <div className="absolute -left-8 -top-12 hidden sm:block z-0">
          <MascotImage pose="main" size={140} className="drop-shadow-lg" priority />
        </div>

        <div className="card-dark p-8 relative z-10 tex-grain">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-3xl text-sunburst-yellow">AZ</span>
            <span className="font-display text-3xl text-sandstone-cream">Off Script</span>
          </div>
          <h1 className="font-display text-4xl text-sandstone-cream mt-4 leading-none">
            Enter the Off Script Room
          </h1>
          <p className="text-sandstone-cream/80 mt-3 text-sm">
            Private creator space for clips, ideas, approvals, and what&apos;s moving next.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="label !text-sandstone-cream/70" htmlFor="invite">
                    Invite code
                  </label>
                  <input
                    id="invite"
                    className="field"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="CREW-XXXX-XXXX"
                    required
                    autoComplete="off"
                  />
                  <p className="text-xs text-sandstone-cream/50 mt-1">
                    Don&apos;t have one? Ask Vanessa.
                  </p>
                </div>
                <div>
                  <label className="label !text-sandstone-cream/70" htmlFor="name">
                    Your name
                  </label>
                  <input
                    id="name"
                    className="field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vanessa"
                    required
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="label !text-sandstone-cream/70" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@azoffscript.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label !text-sandstone-cream/70" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="bg-copper-deep/30 border border-copper-clay text-sandstone-cream rounded-xl p-3 text-sm animate-slide-in">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? "Walking in…" : mode === "signin" ? "Enter the Room" : "Join the Room"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="text-cactus-teal hover:text-sunburst-yellow font-bold underline"
            >
              {mode === "signin" ? "Need access? Request it" : "Already in? Sign in"}
            </button>
            <Link href="/" className="text-sandstone-cream/50 hover:text-sandstone-cream text-xs">
              Back to site
            </Link>
          </div>

          <p className="mt-4 text-xs text-sandstone-cream/40 text-center">
            Having trouble getting in? Text Vanessa.
          </p>
        </div>
      </div>
    </main>
  );
}
