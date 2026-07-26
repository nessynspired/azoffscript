/**
 * Quick Terms — the first-login room rules agreement.
 *
 * Bump QUICK_TERMS_VERSION when the terms change to force re-acceptance.
 * The app checks the user's latest accepted version against this constant.
 */

export const QUICK_TERMS_VERSION = "v1";

export const WELCOME_COPY = {
  title: "Welcome to the Room 🌵",
  body: `You're inside AZ Off Script — the place where the First Wave can see what's coming, drop clips, share ideas, approve content, and keep everything organized.

This is still meant to be fun, simple, and not forced.

A few things before you start:

• AZ Off Script is one shared brand first.
• Your personal page is still yours.
• Official content posts from the AZ Off Script page first.
• Don't post raw clips, drafts, screenshots, or behind-the-scenes content without approval.
• Clips need approval before they go live.
• "Do Not Post" wins before something is posted.
• No kids are posted by default.
• Nothing is paid or promised right now.
• If money ever becomes involved, written terms will come first.

We give the idea. You bring the moment.`,
  button: "Enter the Room",
};

export const QUICK_TERMS_COPY = {
  title: "Quick Room Rules",
  intro:
    "Before entering the AZ Off Script portal, please agree to the basic room rules. These quick terms help protect the brand, the people in the room, and the content we create together.",
  checkboxes: [
    "I understand AZ Off Script is the official home for the AZ Off Script brand, pages, portal, content system, logo, mascot, and brand materials, managed by the Founder / Authorized Brand Representative.",
    "I understand I keep my personal page, personal identity, unrelated content, and personal brand.",
    "I understand official AZ Off Script content should post on the official AZ Off Script page first unless the Founder / Authorized Brand Representative approves otherwise.",
    "I agree not to post, share, leak, livestream, or distribute raw footage, drafts, screenshots, portal screens, private group messages, unreleased captions, or behind-the-scenes content without approval.",
    "I understand clips need approval before posting when someone is clearly seen, heard, named, tagged, or made part of the content.",
    'I understand "Do Not Post" wins before a clip goes live.',
    "I understand no kids are posted by default.",
    "I understand nothing is paid or promised right now.",
    "I understand future money, sponsors, merch, platform revenue, or paid opportunities require written terms before anything is owed or split.",
    "I understand I may need to sign the full Creator Participation + Media Release before uploading clips, filming official content, or appearing in posted videos.",
  ],
  button: "I Agree — Enter the Room",
  footer:
    "These quick terms do not replace the full Creator Participation + Media Release. The full release is required before official filming, posting, or monetized content.",
};
