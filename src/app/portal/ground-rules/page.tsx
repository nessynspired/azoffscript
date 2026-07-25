"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { MascotImage } from "@/components/MascotImage";

const RULES = [
  {
    title: "If you're in it, you approve it.",
    body: "Nobody posts a clip you're in without your greenlight. Tap Good to Go, Needs a Tweak, I Don't Like How I Come Across, or Do Not Post Yet.",
    tone: "core",
  },
  {
    title: "Tag who's in it.",
    body: "When you send a clip, tag everyone who appears. They'll get a chance to approve before it goes anywhere.",
    tone: "core",
  },
  {
    title: "Comfort tags are real.",
    body: "If someone has a comfort tag (no exes, no real names, no location), respect it. Always.",
    tone: "core",
  },
  {
    title: "Don't post someone else's worst moment.",
    body: "We're funny, not mean. If it's embarrassing in a way that hurts, it doesn't go up.",
    tone: "heart",
  },
  {
    title: "How the room moves.",
    body: "Crew sends their finals. Vanessa stitches them together, schedules, and posts. The Run Sheet tracks it all: Dropped → Planned → Shot → Review → Ready → Scheduled → Live.",
    tone: "flow",
  },
  {
    title: "Ideas are free.",
    body: "Throw anything on the Spark Board. Bad ideas are welcome — they lead to good ones.",
    tone: "creative",
  },
  {
    title: "The Run Sheet is the source of truth.",
    body: "If it's not on the Run Sheet, it's not happening. Check it before you ask what's next.",
    tone: "flow",
  },
  {
    title: "Have fun. That's the whole point.",
    body: "If it stops being fun, say something. We'll fix it.",
    tone: "heart",
  },
];

const COMFORT_RULES = [
  {
    title: "Funny does not mean humiliating.",
    body: "We can laugh at the moment, the question, the situation, or the reaction — but we do not make a person the joke unless they are clearly comfortable with that specific clip.",
  },
  {
    title: "No one is required to be the main character.",
    body: "Nobody has to be the funny one, the loud one, the silly one, or the center of attention. Some people are on-camera. Some people react. Some people help behind the scenes. All of that counts.",
  },
  {
    title: "No one is required to share.",
    body: "Nobody has to share, repost, comment on, or promote a clip. That's always optional.",
  },
  {
    title: "If you don't like how you come across, say so.",
    body: "If you don't like how you look, sound, react, or come across in a clip, you can say Do Not Post. No drama needed.",
  },
  {
    title: "Comfort issues go on hold.",
    body: "If a clip causes tension, embarrassment, attitude, hurt feelings, or discomfort, it goes on hold for comfort review. Vanessa can review it privately or decide not to use it. No arguing in the group chat.",
  },
  {
    title: "Each member chooses their comfort level.",
    body: "Every member can set their Content Comfort, Share Comfort, and \"please don't use me for\" preferences in My Kit. Defaults to \"Ask Every Time\" until they change it.",
  },
];

const TONE_CHIP: Record<string, string> = {
  core: "chip-copper",
  heart: "chip-danger",
  flow: "chip-teal",
  creative: "chip-yellow",
};

export default function GroundRulesPage() {
  const { member } = useAuth();
  const supabase = createClient();
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgedAt, setAcknowledgedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    supabase.from("members").select("ground_rules_acknowledged_at").eq("id", member.id).single().then(({ data }) => {
      if (data?.ground_rules_acknowledged_at) {
        setAcknowledged(true);
        setAcknowledgedAt(data.ground_rules_acknowledged_at);
      }
    });
  }, [member, supabase]);

  async function acknowledge() {
    if (!member) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("members")
      .update({ ground_rules_acknowledged_at: now })
      .eq("id", member.id);
    if (!error) {
      setAcknowledged(true);
      setAcknowledgedAt(now);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-desert-night leading-none">How the Room Works</h1>
          <p className="text-smoked-charcoal/70 mt-2 text-lg">The vibe, the flow, and how we treat each other. Read once.</p>
        </div>
        <div className="hidden md:block shrink-0">
          <MascotImage pose="main" size={100} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RULES.map((rule, i) => (
          <div key={i} className={`card p-5 ${i % 2 === 0 ? "sticker" : ""}`}>
            <span className={`chip ${TONE_CHIP[rule.tone]} mb-3`}>#{i + 1}</span>
            <h3 className="font-display text-xl text-desert-night leading-tight">{rule.title}</h3>
            <p className="text-sm text-smoked-charcoal/80 mt-2">{rule.body}</p>
          </div>
        ))}
      </div>

      {/* Comfort + Respect Rules */}
      <div className="pt-4">
        <h2 className="font-display text-3xl text-desert-night mb-2">Comfort + Respect</h2>
        <div className="card-dark p-5 mb-4">
          <p className="text-sandstone-cream text-lg">
            The one thing that matters most: <span className="font-bold text-sunburst-yellow">if someone is not comfortable with how they are shown, the clip is not ready.</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMFORT_RULES.map((rule, i) => (
            <div key={i} className={`card p-5 ${i % 2 === 0 ? "sticker-right" : ""} bg-copper-deep/5 border-copper-clay/30`}>
              <span className="chip chip-copper mb-3">#{i + 1}</span>
              <h3 className="font-display text-xl text-desert-night leading-tight">{rule.title}</h3>
              <p className="text-sm text-smoked-charcoal/80 mt-2">{rule.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgement */}
      <div className={`card p-6 ${acknowledged ? "bg-cactus-teal/15 border-2 border-cactus-teal" : "bg-copper-deep/10 border-2 border-copper-clay"}`}>
        <div className="flex items-center gap-4">
          <MascotImage pose="main" size={60} className="shrink-0" />
          <div className="flex-1">
            {acknowledged ? (
              <>
                <p className="font-display text-xl text-cactus-teal">You&apos;re good to go.</p>
                <p className="text-sm text-smoked-charcoal/70">
                  Acknowledged {acknowledgedAt ? new Date(acknowledgedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : ""}.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-desert-night">Read all that?</p>
                <p className="text-sm text-smoked-charcoal/70 mt-1">Tap below to confirm you understand the ground rules.</p>
              </>
            )}
          </div>
          {!acknowledged && (
            <button onClick={acknowledge} className="btn btn-primary">I Understand</button>
          )}
        </div>
      </div>
    </div>
  );
}
