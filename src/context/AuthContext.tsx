"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/db";

type Member = Database["public"]["Tables"]["members"]["Row"];

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  member: Member | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  member: null,
  loading: true,
  signOut: async () => {},
  refreshMember: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        await loadMember(session.user.id);
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          await loadMember(newSession.user.id);
        } else {
          setMember(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time: update member data when the member's row changes (e.g. admin
  // grants or revokes can_plan_content). This lets planners see their new
  // menu items immediately without logging out and back in.
  useEffect(() => {
    if (!member?.id) return;
    const channel = supabase
      .channel(`member:${member.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "members", filter: `id=eq.${member.id}` },
        (payload) => {
          setMember(payload.new as Member);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [member?.id]);

  async function loadMember(userId: string) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", userId)
      .single();
    setMember(data);
  }

  async function refreshMember() {
    if (session?.user) await loadMember(session.user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setMember(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, member, loading, signOut, refreshMember }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
