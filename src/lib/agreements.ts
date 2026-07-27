// ===========================================================================
// AZ OFF SCRIPT — Versioned participation agreements
// ===========================================================================
// Each version is a constant exported here. The admin can activate a version
// from /portal/agreements; crew sign in-app once activated.
//
// To release a new version:
//   1. Add a new constant here (e.g. AGREEMENT_V2)
//   2. Add it to ALL_AGREEMENTS
//   3. Admin activates it from the portal — existing signatures stay tied to
//      the version they signed.
// ===========================================================================

export interface AgreementDoc {
  version: string;
  title: string;
  summary: string;
  bodyMarkdown: string;
  /** Exhibit groupings for the Table of Contents. Each exhibit covers a range of sections. */
  exhibits?: ExhibitGroup[];
}

export interface ExhibitGroup {
  id: string;          // e.g. "main", "exhibit-a"
  label: string;       // e.g. "Main Agreement", "Exhibit A"
  title: string;       // e.g. "Posting Rules"
  /** Section prefix for letter-prefixed exhibits (e.g. "A." for A.1, A.2). Empty for main. */
  sectionPrefix?: string;
  /** Section numbers (from # N. Title headings) included in this exhibit */
  sections: number[];
}

// ---------------------------------------------------------------------------
// v1 — First Wave Participation Rules + Media Release
// ---------------------------------------------------------------------------

export const AGREEMENT_V1: AgreementDoc = {
  version: "v1",
  title: "First Wave Participation Rules + Media Release",
  summary:
    "Pre-filming participation, media rights, posting rules, brand expansion, content ownership, future waves, and no-money-promise rules. Business draft for attorney review and electronic signature.",
  bodyMarkdown: `# AZ OFF SCRIPT LLC

# First Wave Participation Rules + Media Release

**For AZ Off Script First Wave participants, future waves, creator participants, planners, guests, and collaborators**

**Prepared for:** First Wave participants and future AZ Off Script creator participants
**Prepared by:** AZ Off Script LLC
**Brand owner / administrator:** Vanessa Williams
**Purpose:** Pre-filming participation, media rights, posting rules, brand expansion, content ownership, future waves, and no-money-promise rules
**Status:** Business draft for attorney review and electronic signature

---

## Important Review Notice

This document explains the rules for participating in AZ Off Script before anyone records, submits clips, appears in videos, wears branded gear, accesses the creator portal, or participates in official AZ Off Script content.

This document is meant to keep the project fun, clear, organized, respectful, and protected. It is not meant to take anyone's personal identity, personal page, unrelated content, private life, or personal brand.

This document is a business draft. AZ Off Script LLC and each participant should have the opportunity to ask questions and seek independent legal advice before signing.

---

# 1. Plain-English Summary

AZ Off Script is an Arizona creator and media brand built to grow across different content lanes, waves, casts, locations, and formats.

The first active version is the **AZ Off Script First Wave** — a women-led Arizona creator room built around real reactions, group chemistry, local humor, quick prompts, trend remixes, social clips, and off-script moments.

The original idea is still the same for the First Wave:

- build **one shared AZ Off Script page first**
- keep it fun, local, and personality-driven
- let people bring their own energy
- do not force scripts
- do not make anyone pay to participate
- tag or credit individual pages when appropriate
- possibly create paid opportunities later if the brand grows

AZ Off Script LLC may later expand into other waves, casts, locations, or content lanes, including women, men, couples, mixed groups, local business content, Arizona-wide content, city-specific content, or other AZ Off Script sub-brands.

Participation in the First Wave does not give Participant ownership or control over future AZ Off Script waves, future casts, future pages, future sponsors, future formats, future money, future members, or future business opportunities.

Nothing is paid or promised right now.

AZ Off Script LLC is the official business home for the brand. That means the LLC holds and manages the official page, name, logos, mascot, website, portal, content systems, brand assets, gear, sponsorship conversations, posting rules, and future money systems.

Participation does **not** make a participant an owner of AZ Off Script LLC.

This Agreement explains:

- what AZ Off Script is
- who owns the official brand
- what content can be posted
- what content cannot be posted
- how clip approval works
- what happens if someone says "Do Not Post"
- what happens if someone leaves or is removed
- what happens to previously approved content
- what happens with raw footage and drafts
- what happens if money or sponsors come later
- how children, locations, privacy, comfort, and brand safety are protected
- how AZ Off Script can expand into future waves

---

# 2. Good-Faith Participation Understanding

Participant understands that AZ Off Script was introduced as a fun First Wave creator pilot focused on building one shared Arizona creator brand first.

The purpose was not to pressure anyone, take over anyone's personal page, or promise guaranteed money.

The purpose was to create something organized, local, fun, personality-driven, and potentially valuable over time if the brand grows.

AZ Off Script LLC is the business entity that holds and manages the official brand so there is one clear home for:

- official pages
- official clips
- approvals
- tags
- gear
- content planning
- sponsor conversations
- future revenue rules
- brand protection
- participant comfort
- legal organization

Participant understands that AZ Off Script can be a shared creator experience without being shared LLC ownership.

---

# 3. Parties

This **First Wave Participation Rules + Media Release Agreement** is entered into between:

## Company

**AZ Off Script LLC**, an Arizona limited liability company, including its owner, authorized representatives, successors, assigns, official social media pages, website, portal, brand assets, and related business operations.

Referred to as:

- "AZ Off Script"
- "Company"
- "Brand"
- "Official Brand"

## Participant

The individual signing this Agreement.

Referred to as:

- "Participant"
- "Creator"
- "Crew Member"
- "Member"

---

# 4. What AZ Off Script Is

AZ Off Script is an Arizona creator and media brand built around:

- real reactions
- group games
- quick prompts
- local Arizona humor
- creator challenges
- social media clips
- short-form video
- trend remixes
- content calendar planning
- personality-based formats
- brand-safe sponsored opportunities later
- official AZ Off Script merch and gear
- future waves, casts, and content lanes

The brand may post content on platforms including:

- TikTok
- Instagram
- Facebook
- YouTube Shorts
- AZ Off Script website
- email or media kits
- sponsor decks
- future official AZ Off Script platforms

---

# 5. Brand Architecture and Future Expansion

Participant understands that AZ Off Script LLC owns and manages the **AZ Off Script umbrella brand**.

AZ Off Script may include different versions, waves, casts, shows, locations, content lanes, pages, series, or sub-brands over time.

Examples may include:

- AZ Off Script Women
- AZ Off Script First Wave
- AZ Off Script Couples
- AZ Off Script Men
- AZ Off Script Local
- AZ Off Script West Valley
- AZ Off Script Phoenix
- AZ Off Script Arizona
- AZ Off Script Eats
- AZ Off Script Tries It
- AZ Off Script After Dark
- AZ Off Script Moms
- other names, shows, formats, or brand lanes approved by AZ Off Script LLC

The current First Wave is the first active group. It does not limit AZ Off Script LLC from expanding, changing, rebranding, adding new people, adding new waves, adding men, adding couples, adding mixed casts, adding city-based casts, or creating separate content lanes in the future.

Participant's participation in one wave, group, show, clip, shoot, portal, or content lane does not create ownership or approval rights over any other AZ Off Script wave, cast, page, show, location, sponsor deal, future member, or future business opportunity.

---

# 6. Current First Wave / Women's Lane

Participant understands that the current First Wave is a women-led AZ Off Script content lane.

The First Wave may be publicly described as:

- AZ Off Script First Wave
- AZ Off Script Women
- the women's room
- the first AZ Off Script creator crew
- a women-led Arizona creator room
- another similar brand-safe description approved by AZ Off Script LLC

This does not mean AZ Off Script as a whole is limited to women-only content forever.

The First Wave may remain its own lane even if AZ Off Script later adds men, couples, mixed groups, other Arizona cities, guest creators, or separate sub-brands.

---

# 7. What AZ Off Script Is Not

AZ Off Script is not:

- an employment relationship
- an equal partnership between all participants
- a joint venture owned by the group
- a guarantee of payment
- a guarantee of sponsorships
- a guarantee of followers
- a guarantee of virality
- a guarantee of equal screen time
- a guarantee of permanent membership
- a guarantee that every submitted clip will be used
- a guarantee that every person will be tagged every time
- a promise that every person will be involved in every future opportunity
- a promise that First Wave participants control future waves
- a promise that all future AZ Off Script content will be women-only

---

# 8. Role Definitions

## Owner / Admin

Vanessa Williams, or another person formally authorized by AZ Off Script LLC.

Admin controls final decisions for:

- official brand direction
- content calendar
- posting schedule
- clip status
- portal access
- gear
- member listings
- approvals
- archived content
- sponsor conversations
- future money-side activation
- legal documents
- removal or suspension decisions
- future waves
- final brand protection decisions

## Planner

A person authorized by Admin to help with content research, planning, organization, calendar building, Trend Drops, Quick Drops, Weekly Heat, and content coordination.

Any crew member may be designated as a Planner by Admin.

Planner access does not create LLC ownership, legal authority, payout approval, sponsorship authority, or the right to override "Do Not Post" unless AZ Off Script gives separate written permission.

## Crew Member

A participant who may:

- appear in content
- submit clips
- submit ideas
- submit trend links
- approve or reject clips they appear in
- access My Kit
- receive gear
- participate in official AZ Off Script content

## Guest

A person who appears in a limited clip, event, or video but is not a regular crew member. Guests may be required to sign a separate release before content is posted.

---

# 9. No LLC Ownership / No Partnership

Participant understands and agrees that participating in AZ Off Script does not create ownership in AZ Off Script LLC.

Participant does not receive:

- LLC membership interest
- voting rights
- ownership of the brand
- ownership of the official social pages
- ownership of the website
- ownership of the creator portal
- ownership of the audience or followers
- ownership of analytics
- ownership of sponsors or business contacts
- ownership of the AZ Off Script name
- ownership of the logo, mascot, colors, slogans, merch designs, or templates
- authority to bind AZ Off Script LLC to any contract, payment, promise, sponsor deal, refund, partnership, or legal obligation
- approval rights over future waves, casts, or business directions

Nothing in this Agreement creates employment, partnership, joint venture, franchise, agency, fiduciary duty, or equal ownership.

---

# 10. What Participant Keeps

Participant keeps ownership and control of Participant's:

- personal name
- personal identity
- personal social media pages
- personal brand
- unrelated content
- unrelated photos or videos
- unrelated business
- unrelated creative work
- personal audience
- personal likeness outside AZ Off Script content
- personal opinions outside official AZ Off Script representation

This Agreement does not give AZ Off Script ownership over Participant's whole life, personal page, private content, family, business, or unrelated creative work.

---

# 11. AZ Off Script Brand Ownership

AZ Off Script LLC owns, controls, or manages the official AZ Off Script brand, including:

- brand name
- logo
- cactus mascot
- slogans
- taglines
- brand colors
- brand voice
- public website
- creator portal
- Lobby
- Drop
- Run Sheet
- Spark Board
- Ready Bank
- Trend Lab
- Brand Locker
- My Kit
- Money Side
- Ground Rules
- social media pages
- official captions
- hashtag bank
- sponsor pitch language
- media kit
- merch templates
- gear designs
- member cards
- content templates
- Quick Drop Library
- content calendar
- official finished videos
- official edited clips
- official group posts
- official archive
- current and future AZ Off Script waves, shows, lanes, and sub-brands

Participant may not copy, sell, register, reproduce, monetize, manufacture, distribute, or use AZ Off Script branding for a separate project without written permission from AZ Off Script LLC.

---

# 12. Submitted Content

"Submitted Content" means any content Participant creates, records, uploads, sends, drops, submits, approves, or provides for possible AZ Off Script use.

Submitted Content may include:

- videos
- clips
- photos
- audio
- voice recordings
- reactions
- facial expressions
- gestures
- captions
- hashtags
- comments
- ideas
- trend links
- screenshots submitted for planning
- behind-the-scenes content
- portal uploads
- text answers
- member-card information
- approved bio details
- social handle information
- content recorded at an AZ Off Script shoot
- content created in response to an AZ Off Script prompt

---

# 13. Rights Granted to AZ Off Script

Participant grants AZ Off Script LLC the right to use Submitted Content created for, submitted to, uploaded into, recorded during, approved for, or used by AZ Off Script.

This includes the right to:

- review
- edit
- crop
- cut
- caption
- stitch
- remix
- combine
- sequence
- format
- archive
- post
- repost
- promote
- publish
- display
- distribute
- use in compilations
- use on the website
- use in social media content
- use in sponsor pitches
- use in brand decks
- use in media kits
- use in paid ads
- use in future official AZ Off Script platforms
- monetize if money is later active under written terms

If any Submitted Content cannot legally be assigned to AZ Off Script, Participant grants AZ Off Script LLC a worldwide, perpetual, irrevocable, royalty-free, sublicensable, transferable license to use that Submitted Content in connection with AZ Off Script.

---

# 14. Name, Image, Voice, and Likeness Release

Participant gives AZ Off Script permission to use Participant's:

- name
- nickname
- social handle, when approved
- image
- face
- voice
- likeness
- gestures
- reactions
- facial expressions
- personality
- approved bio details
- First Wave title
- member card
- role title
- recorded performance

This permission applies only to AZ Off Script-related content, official posts, promotional materials, website features, group clips, short-form videos, sponsor pitches, brand decks, media kits, and official brand uses.

Tagging Participant's personal social media page is separate from posting permission.

---

# 15. Use of Existing Content Across the AZ Off Script Brand

Participant understands that content created for, submitted to, approved for, or posted by AZ Off Script may be used across the official AZ Off Script umbrella brand, including official social pages, website, archives, compilations, media kits, sponsor decks, promotional materials, and future official AZ Off Script channels.

AZ Off Script may use First Wave content to explain, promote, recap, archive, or advertise the AZ Off Script brand, even if the brand later expands into additional waves, cities, casts, men's content, couples content, or mixed-group content.

AZ Off Script will not knowingly use Participant's approved First Wave content in a materially misleading, defamatory, sexually explicit, hateful, or dangerous context.

If AZ Off Script wants to use Participant's content in a materially different context that changes the meaning of the clip in a way a reasonable person would not expect, AZ Off Script may seek additional approval or choose to crop, blur, de-identify, or not use the clip.

---

# 16. No Control Over Spin-Offs or Sub-Brands

Participant understands that AZ Off Script LLC may create spin-offs, sub-brands, shows, pages, campaigns, or related projects under the AZ Off Script umbrella.

Participant does not receive ownership, approval rights, revenue rights, or control over any spin-off, sub-brand, show, page, cast, or campaign unless Participant is directly involved in that specific opportunity and a written agreement says Participant receives compensation or rights.

Being part of the First Wave does not automatically make Participant part of AZ Off Script Couples, AZ Off Script Men, AZ Off Script Local, future city casts, future sponsor campaigns, future merch lines, or future paid opportunities.

---

# 17. Posting Approval Rule

AZ Off Script uses clip-specific posting approval as an internal trust and comfort rule.

A clip is not ready to post until the people who are clearly:

- visible
- audible
- named
- tagged
- centered in the joke
- made part of the content
- used as a reaction
- included in a way a normal viewer would recognize

have been given a reasonable opportunity to approve that specific clip.

Approval options may include:

- Approved
- Approved, but do not tag me
- Needs a tweak
- I do not like how I come across
- Hold for comfort review
- Do Not Post

No response means the clip is not ready yet.

---

# 18. "Do Not Post" Before Posting

Before publication, "Do Not Post" controls.

If Participant says "Do Not Post" before a clip is posted, AZ Off Script will not knowingly post that clip with Participant clearly included unless Participant later gives clear approval.

No participant, planner, crew member, or admin may pressure, shame, guilt, threaten, harass, or punish someone for saying "Do Not Post."

---

# 19. Difference Between Approval and Ownership

The approval process protects comfort, dignity, safety, and trust.

The approval process does not transfer ownership of AZ Off Script content back to Participant.

Once Participant approves a clip and AZ Off Script posts, schedules, publishes, promotes, archives, or materially relies on that approval, Participant cannot automatically revoke AZ Off Script's rights just because Participant later:

- leaves the group
- becomes inactive
- becomes upset
- changes their mind
- dislikes comments
- dislikes the clip's performance
- disagrees with another participant
- no longer wants to be associated with the brand
- wants to start something separate
- wants the brand to remove all old content

AZ Off Script may voluntarily remove, crop, archive, edit, hide, or stop using a clip when reasonable, but AZ Off Script is not automatically required to delete previously approved or posted content unless required by law, platform rules, a written settlement, or a separate written agreement.

---

# 20. Previously Approved Content After Leaving

If Participant leaves, is removed, becomes inactive, or no longer wants to participate, AZ Off Script LLC is not required to delete, transfer, surrender, or stop using previously approved AZ Off Script content.

Previously approved and posted content may remain on:

- official AZ Off Script pages
- website
- archives
- compilations
- sponsor proof-of-work
- media kits
- promotional materials
- analytics records
- historical brand records

If Participant leaves before approving an unpublished clip, that clip will remain on hold unless:

- Participant later approves it
- AZ Off Script removes or de-identifies Participant
- AZ Off Script edits Participant out
- another lawful basis applies
- a separate written agreement allows use

AZ Off Script will review serious safety, privacy, child-related, legal, or major comfort concerns in good faith.

---

# 21. Official Page First / No Unapproved Posting

Participant understands that AZ Off Script is being built as one official shared creator brand first.

Participant may not post, publish, leak, livestream, upload, sell, distribute, or share without Admin approval:

- raw footage
- draft clips
- unreleased videos
- behind-the-scenes footage
- screenshots
- unreleased captions
- portal screens
- internal planning materials
- private group messages
- sponsor conversations
- unpublished AZ Off Script content
- rejected clips
- comfort-review clips
- clips showing another participant without approval

Unless Admin approves otherwise, official AZ Off Script content should post on the official AZ Off Script page first.

Participant may repost or share official AZ Off Script content after it is live, unless the content is marked:

- Hold
- Do Not Repost
- Internal Only
- Sponsor Restricted
- No Tag
- Private
- Not Yet Live

This rule protects launch timing, brand quality, participant comfort, sponsor obligations, and the ability of AZ Off Script LLC to manage the official brand consistently.

---

# 22. Future Waves and New Members

AZ Off Script LLC may invite, add, replace, pause, remove, or reorganize participants, guests, planners, creators, couples, men, women, mixed groups, or other contributors at any time based on brand needs.

Future waves may be created based on:

- location
- gender
- couples
- age range
- content style
- chemistry
- availability
- reliability
- comfort level
- sponsor needs
- production needs
- audience response
- safety
- business direction
- brand expansion

Participant does not have the right to approve or block future members, future waves, future casts, future content lanes, future page names, or future AZ Off Script business decisions.

AZ Off Script may continue building the brand with current participants, new participants, replacement participants, guests, couples, men, women, or mixed casts.

---

# 23. No Guaranteed Permanent Participation

Participant understands that AZ Off Script may grow, change, pause, replace roles, add new members, invite future waves, remove inactive members, or adjust the crew based on:

- brand needs
- reliability
- comfort
- chemistry
- safety
- scheduling
- content fit
- business direction
- communication
- participation level
- group trust
- legal or sponsor obligations
- future expansion plans

Participation in one meeting, one shoot, one clip, one portal invitation, one First Wave activity, or one piece of content does not guarantee:

- permanent membership
- equal screen time
- future posting
- future tagging
- future payment
- continued portal access
- continued use of title
- continued listing on the crew page
- participation in future waves
- approval rights over new members
- approval rights over brand expansion
- payment from content Participant is not involved in

---

# 24. Leaving the Group

Participant may leave AZ Off Script by giving written notice to Admin.

Leaving does not:

- transfer ownership of AZ Off Script content to Participant
- require AZ Off Script to delete previously approved and posted content
- require AZ Off Script to remove Participant from every past clip, caption, archive, website reference, or promotional material
- give Participant ownership of social pages, followers, sponsors, portal, gear templates, content systems, or brand assets
- cancel rights already granted to AZ Off Script
- create a payout unless an active written revenue agreement says so
- give Participant approval rights over future waves or future brand direction

After leaving, Participant may lose access to:

- creator portal
- My Kit
- Brand Locker
- Run Sheet
- Ready Bank
- Trend Lab
- internal group messages
- unpublished clips
- sponsor information
- future group materials

AZ Off Script may update public crew pages, remove Participant from current member listings, stop tagging Participant, and mark Participant as former crew where appropriate.

---

# 25. Removal or Suspension

AZ Off Script may remove or suspend a participant for reasons including:

- posting raw footage without permission
- sharing confidential information
- violating clip approval rules
- pressuring others
- harassing, threatening, bullying, or doxxing
- damaging the brand
- creating safety risks
- making unauthorized money promises
- misusing the logo, name, mascot, gear, or sponsor contacts
- refusing to follow posting rules
- repeated unreliability
- public drama tied to the brand
- unauthorized use of AZ Off Script content
- conduct that materially disrupts the group
- conduct that makes continued participation unsafe or unworkable

Removal does not erase rights already granted to AZ Off Script.

---

# 26. Kids and Family Safety

No child's face, voice, name, school, location, medical information, schedule, or identifying details may be posted by default.

AZ Off Script content should not include children unless:

- Admin separately approves the specific clip
- the child's parent or legal guardian gives clear permission
- the clip is reviewed for safety
- the child is not exposed in a harmful, embarrassing, unsafe, private, or identifying way

Participants must not upload or submit clips showing children in the background unless they have the legal right to do so and clearly identify the issue for Admin review.

Default brand rule:

**No kids in AZ Off Script content.**

---

# 27. Location Safety

Participant agrees not to expose private or unsafe location details, including:

- home addresses
- apartment names
- school names
- exact filming locations
- license plates
- house numbers
- mail
- packages
- children's locations
- live real-time location
- private meetup spots before or during filming

Approved broad location language may include:

- Arizona
- West Valley
- Phoenix area
- Buckeye area
- local AZ spot
- Arizona business

Specific addresses, private homes, and real-time whereabouts should not be posted unless Admin approves and it is safe.

---

# 28. Comfort, Dignity, and Humor

AZ Off Script can be funny without humiliating people.

Participant agrees:

- funny does not mean embarrassing someone
- no one is required to be silly, loud, dramatic, or the center of attention
- no one is required to repost, share, comment on, or promote a clip
- no one should be made the joke unless they clearly approve that specific use
- clips about body, beauty, parenting, relationships, private life, money, health, trauma, children, or family conflict require extra care
- if someone does not like how they look, sound, react, or come across, they may request edits or say "Do Not Post" before publication
- if a clip creates tension, embarrassment, confusion, hurt feelings, or attitude, Admin may place it on "Hold — Comfort Review"

Some people may be on camera.
Some may be low-key.
Some may react.
Some may help behind the scenes.
All approved roles are valid.

---

# 29. Gear, Shirts, Tumblers, and Member Items

AZ Off Script may create or provide branded gear, shirts, tumblers, mugs, badges, stickers, cards, or other items.

Gear may be:

- a welcome item
- a promotional gift
- a filming prop
- a member kit item
- a sample
- a future merchandise design

Unless AZ Off Script clearly says otherwise in writing, receiving personalized gear does not create ownership in:

- AZ Off Script brand
- logo
- mascot
- designs
- merch templates
- future product revenue
- LLC membership
- social media pages

Participant may not sell, duplicate, reproduce, alter, manufacture, or distribute AZ Off Script gear designs without written permission.

If Participant leaves or is removed, AZ Off Script may allow Participant to keep gifted personal gear, but Participant may not use the gear to falsely imply current membership, sponsorship, ownership, or authority to represent AZ Off Script.

---

# 30. Brand Use Restrictions

Participant may not use AZ Off Script brand assets without written permission, including:

- logo
- mascot
- brand name
- official captions
- templates
- gear designs
- media kit
- sponsor pitch materials
- website content
- portal screens
- content library
- unreleased ideas
- official graphics
- member cards
- slogans
- taglines
- future wave names
- spin-off names
- show names

Participant may not create a confusingly similar page, group, merch line, or brand using AZ Off Script materials.

Participant may not claim to own, represent, speak for, or bind AZ Off Script unless authorized in writing.

---

# 31. Money Is Not Active Yet

Money is not active yet unless AZ Off Script LLC separately activates a written monetization arrangement.

No participant is currently promised:

- payment
- equal split
- future sponsorship money
- platform revenue
- merch revenue
- ownership
- royalties
- bonuses
- reimbursement
- brand deals
- follower growth
- individual page growth
- paid opportunities
- paid employment
- revenue from future waves
- revenue from content Participant is not involved in

No participant may publicly state, comment, DM, or imply that AZ Off Script guarantees money, employment, payment, splits, or paid opportunities.

---

# 32. Future Money Rules

If AZ Off Script begins receiving revenue, money will be handled only after:

1. revenue is actually received
2. direct costs are deducted
3. the applicable written revenue terms are active
4. contributors are identified
5. Admin approves the payout record
6. any required tax or payment information is collected

Revenue may include:

- paid content
- sponsor posts
- platform revenue
- merch revenue
- local business collabs
- event appearances
- affiliate revenue
- gifted products or services
- brand partnerships
- future wave opportunities
- city-based opportunities
- couples content
- men's content
- mixed-cast content
- other AZ Off Script sub-brands

No payment is owed unless a written agreement or written payout terms are active.

---

# 33. Revenue by Event, Lane, or Opportunity

Revenue is handled by revenue event, content lane, campaign, or business opportunity.

Participant is not entitled to revenue from AZ Off Script content, pages, shows, sponsors, merch, events, or opportunities that Participant did not participate in, unless a separate written agreement says otherwise.

If AZ Off Script creates future waves, such as AZ Off Script Couples, AZ Off Script Men, AZ Off Script Local, or other brand lanes, revenue from those lanes belongs to AZ Off Script LLC and the contributors involved in that specific opportunity according to the applicable written terms.

First Wave participation does not create a right to future AZ Off Script revenue from unrelated waves, unrelated campaigns, unrelated sponsor deals, unrelated merch, or unrelated content.

---

# 34. Default Future Split Templates

These split templates are not active unless AZ Off Script activates money-side terms in writing.

Unless a separate written agreement says otherwise, AZ Off Script may use the following internal planning templates.

## Paid Content / Sponsor Post

After direct costs are deducted:

- 50% Brand / Operations
- 15% Planner / Orchestration, if a planner materially helped research, organize, or calendar the opportunity
- 35% Content Contributor Pool, split among people whose clips, appearances, or contributions are used in the paid content

## Platform Revenue

Platform revenue may be tracked monthly.

Payouts may only be considered after the monthly net threshold set by AZ Off Script.

After direct costs are deducted:

- 50% Brand / Operations
- 15% Planner / Orchestration, if active that month
- 35% Content Contributor Pool for posted content during that revenue period

## Merch Revenue

After product, printing, shipping, platform, payment processing, and direct costs are deducted:

- 80% Brand / Operations
- 20% Promo Contributor Pool only if crew directly helped promote or sell that merch

Personalized member gear given as a welcome kit, gift, sample, or filming prop is not a revenue split item.

---

# 35. Brand Owner and Planner Role Understanding

Participant understands that Vanessa may receive or retain the Brand / Operations share because Vanessa is building, owning, funding, designing, organizing, and operating the AZ Off Script brand, website, portal, software systems, merch, content library, rules, and business infrastructure.

Participant understands that a planner may receive Planner / Orchestration recognition or compensation if that planner materially helps research trends, plan the content calendar, organize Weekly Heat, structure Quick Drops, assign deadlines, or coordinate content that becomes monetized.

Planner status does not give the planner LLC ownership, payout approval authority, legal authority, sponsor authority, or the right to override "Do Not Post" unless separately authorized in writing.

---

# 36. Tax and Payment Information

Before receiving any payout, Participant may be required to provide accurate payment and tax information, including a completed W-9 or other required form.

Participant is responsible for Participant's own taxes, reporting, banking, payment-app fees, and financial records.

AZ Off Script may withhold payment until required tax, payment, identity, or agreement information is complete.

No participant is an employee unless AZ Off Script separately hires that person in writing.

---

# 37. Sponsored, Gifted, Affiliate, or Paid Content

If AZ Off Script receives money, free products, free services, discounts, affiliate commission, gifts, meals, event access, travel, or anything of value from a brand, business, sponsor, or partner, that relationship must be disclosed when required.

Approved disclosure language may include:

- Ad
- Sponsored
- Gifted
- Paid partnership
- Affiliate link
- Hosted by [Brand]
- We were invited by [Business]

Participant may not hide, remove, contradict, or discourage required sponsored-content disclosures.

Participant may not privately promise a sponsor, business, product owner, or local partner any post, review, shoutout, discount, refund, result, or placement unless authorized by AZ Off Script.

---

# 38. Confidentiality

Participant must keep AZ Off Script confidential information private.

Confidential information includes:

- unpublished clips
- raw footage
- drafts
- portal access
- sponsor negotiations
- rates
- payout discussions
- private group messages
- content calendar
- unreleased brand plans
- future waves
- member information
- personal contact details
- private addresses
- filming locations
- legal documents
- revenue records
- analytics not publicly released
- internal disagreements
- future content plans

Participant may not screenshot, forward, post, leak, sell, share, or use confidential information outside AZ Off Script without Admin approval.

---

# 39. No Bypassing AZ Off Script

Participant may not use AZ Off Script contacts, sponsor leads, group opportunities, pitch materials, content templates, unpublished ideas, crew member contacts, or brand systems to secretly bypass AZ Off Script for a competing or substitute opportunity.

This does not stop Participant from having their own social media, personal brand, job, business, or unrelated content.

This only protects AZ Off Script opportunities, contacts, and materials developed through the group.

---

# 40. Public Statements and Disputes

Participant may not knowingly make false, misleading, defamatory, harassing, threatening, or brand-damaging statements about AZ Off Script, its members, sponsors, clients, business partners, or internal operations.

This does not prevent anyone from making truthful reports to law enforcement, regulators, courts, attorneys, tax professionals, or other protected legal channels.

If a dispute happens, Participant agrees to use the dispute process instead of trying to resolve private business issues through public posts, comments, lives, group chats, harassment, or public drama.

---

# 41. Participant Warranties

Participant promises that:

- Participant is at least 18 years old
- Participant has authority to sign this Agreement
- Participant owns or has permission to submit the content Participant submits
- Participant will not knowingly submit content that violates another person's rights
- Participant will not secretly record people where recording is not allowed
- Participant will not submit private, stolen, copyrighted, confidential, or unlawful content
- Participant will identify if a clip includes a child, private location, third party, brand, music issue, or safety concern
- Participant will follow AZ Off Script posting and approval rules

---

# 42. Indemnification

Participant agrees to defend, indemnify, and hold harmless AZ Off Script LLC, its owner, authorized representatives, contractors, planners, and affiliates from third-party claims, losses, fines, costs, damages, and reasonable attorneys' fees arising from:

- Participant's breach of this Agreement
- Participant's unauthorized posting of content
- Participant's false claim of authority
- Participant's submission of content they did not have permission to submit
- Participant's unlawful recording
- Participant's infringement of someone else's rights
- Participant's disclosure of private or confidential information
- Participant's violation of sponsor disclosure rules
- Participant's harassment, threats, defamation, doxxing, or misconduct
- Participant's unauthorized use of AZ Off Script brand assets

---

# 43. No Guarantees

AZ Off Script does not guarantee:

- followers
- views
- virality
- comments
- positive reactions
- brand deals
- sponsorships
- payment
- equal posting
- equal screen time
- equal tagging
- continued membership
- individual page growth
- audience growth
- platform approval
- account performance
- algorithm performance
- income
- business results
- participation in future waves
- approval rights over brand expansion
- revenue from future waves or content Participant is not involved in

Participant understands that social media performance is unpredictable.

---

# 44. Liability Limitation

To the maximum extent allowed by law, AZ Off Script LLC will not be liable to Participant for indirect, incidental, special, punitive, exemplary, or consequential damages, lost followers, lost engagement, lost business opportunities, emotional distress caused by ordinary social media reactions, platform comments, algorithm changes, lost revenue, account limitations, third-party platform outages, or failure of content to perform.

This does not limit liability where the law does not allow limitation.

---

# 45. Emergency Relief

AZ Off Script may seek immediate court relief without completing mediation first if Participant:

- misuses AZ Off Script accounts
- threatens to post confidential or private content
- uses AZ Off Script branding without permission
- claims ownership of the brand or social pages
- interferes with sponsor relationships
- shares raw footage
- leaks private information
- harasses or doxxes members
- creates a serious safety or legal risk
- attempts to interfere with future waves or brand expansion

---

# 46. Dispute Process

Before filing a lawsuit, Participant and AZ Off Script agree to make a good-faith attempt to resolve the dispute privately.

## Step 1: Written Notice

The party raising the dispute must send written notice describing the issue.

## Step 2: Good-Faith Discussion

The parties will allow at least 15 days for good-faith discussion.

## Step 3: Mediation

If unresolved, the parties will attempt one nonbinding mediation session in Maricopa County, Arizona, or remotely.

Emergency court relief may be requested sooner if needed for safety, intellectual property misuse, confidentiality breach, harassment, account control, or other urgent harm.

Arizona law governs this Agreement. Venue for court proceedings will be in the state or federal courts located in Maricopa County, Arizona, unless applicable law requires another venue.

---

# 47. Electronic Signatures and Electronic Approvals

Participant agrees that electronic signatures, portal checkboxes, email confirmations, text confirmations, DM confirmations, and electronic acceptance records may be used to show agreement, approval, or acknowledgment where legally allowed.

Clip approvals may be recorded through:

- portal
- email
- text
- DM
- written message
- electronic form
- other method approved by Admin

---

# 48. Order of Control

If documents or communications conflict, the following order controls:

1. This signed First Wave Participation Rules + Media Release
2. Exhibit A — Posting Rules
3. Exhibit B — Content, Media, Likeness, and Ownership Rights
4. Exhibit C — Money Not Active / Future Revenue Rules
5. Exhibit D — Leaving, Removal, Existing Clips, and Disputes
6. Exhibit E — Brand Architecture, Future Waves, and Expansion Rights
7. Later written amendments signed or electronically accepted by AZ Off Script and Participant
8. Portal settings, My Kit selections, Run Sheet records, and Greenlight records
9. Texts, DMs, calls, meetings, and informal conversations, only to the extent they do not contradict the signed Agreement

---

# 49. Entire Agreement

This Agreement is the complete agreement between AZ Off Script and Participant for pre-filming participation, content rights, posting rules, media release, brand use, raw footage, no-money-promise terms, future waves, expansion rights, leaving/removal issues, and related participant expectations.

Informal conversations, texts, DMs, meetings, or social messages do not change this Agreement unless AZ Off Script and Participant later agree in writing.

---

# 50. Final Acknowledgment Checklist

Participant acknowledges:

- I understand AZ Off Script LLC owns and manages the official AZ Off Script brand.
- I understand AZ Off Script is the umbrella brand and the First Wave is the current women-led room.
- I understand AZ Off Script may later expand into other women, men, couples, mixed groups, cities, Arizona-wide content, and other brand lanes.
- I understand participation does not make me an owner, partner, employee, or shareholder.
- I understand this started as a First Wave pilot to build one shared creator brand first.
- I understand I am not promised payment, equal splits, followers, sponsorships, brand deals, or continued participation.
- I understand I am not promised participation in future waves or future AZ Off Script opportunities.
- I understand AZ Off Script may tag or credit my page when appropriate, but tagging and individual growth are not guaranteed.
- I grant AZ Off Script rights to use content I create, submit, approve, or participate in for AZ Off Script.
- I understand clip-specific approval is required before posting when I am clearly seen, heard, named, tagged, or made part of the joke.
- I understand that if I say "Do Not Post" before publication, the clip will not knowingly be posted with me clearly included.
- I understand that if I approve a clip and it is posted, scheduled, or relied on, I cannot automatically force removal later just because I leave, get upset, or change my mind.
- I understand that if I leave or am removed, prior approved content may remain under AZ Off Script LLC.
- I understand First Wave content may be used to explain, promote, recap, or archive the AZ Off Script brand even if the brand later expands.
- I understand I cannot post raw footage, drafts, private group messages, portal screens, or internal materials without permission.
- I understand official AZ Off Script content should post on the official page first unless Admin approves otherwise.
- I understand I cannot use AZ Off Script logos, gear designs, mascot, templates, future wave names, or brand materials for my own separate thing without permission.
- I understand no kids are posted by default.
- I understand tagging my social page is separate from posting approval.
- I understand sponsored, gifted, affiliate, or paid content must be disclosed when required.
- I understand any future money split requires revenue to be received, direct costs to be deducted, and written payout terms to be active.
- I understand I am not entitled to revenue from content, waves, sponsors, merch, or campaigns I am not involved in unless a separate written agreement says otherwise.
- I understand Vanessa/Admin controls final brand, posting, scheduling, archive, portal, business decisions, future waves, and expansion decisions.
- I understand a planner may help organize content, but planner status does not create LLC ownership.
- I have had the opportunity to ask questions and seek independent legal advice before signing.

---

# 51. Signature Page

## AZ OFF SCRIPT LLC

By: Vanessa Williams
Title: Owner / Authorized Representative
Electronic signature accepted: Yes

## PARTICIPANT

Printed Name: (collected at signing)
Email: (collected at signing)
Phone: (collected at signing)
Social Handles: (collected at signing)
Electronic signature accepted: Yes
`,
  exhibits: [
    {
      id: "main",
      label: "Main Agreement",
      title: "First Wave Participation Rules + Media Release",
      sections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 47, 48, 49, 50, 51],
    },
    {
      id: "exhibit-a",
      label: "Exhibit A",
      title: "Posting Rules",
      sections: [17, 18, 19, 20, 21],
    },
    {
      id: "exhibit-b",
      label: "Exhibit B",
      title: "Content, Media, Likeness & Ownership",
      sections: [22, 23, 24, 25, 26, 27, 28, 29, 30],
    },
    {
      id: "exhibit-c",
      label: "Exhibit C",
      title: "Money / Future Revenue",
      sections: [31, 32, 33, 34, 35, 36, 37],
    },
    {
      id: "exhibit-d",
      label: "Exhibit D",
      title: "Leaving, Removal & Disputes",
      sections: [38, 39, 40, 41, 42, 43, 44, 45, 46],
    },
    {
      id: "exhibit-e",
      label: "Exhibit E",
      title: "Brand Architecture & Future Waves",
      sections: [5, 6, 16, 22],
    },
  ],
};

// Import v2 from its own file (kept separate due to length)
import { AGREEMENT_V2 } from "./agreement-v2";

export const ALL_AGREEMENTS: AgreementDoc[] = [AGREEMENT_V1, AGREEMENT_V2];

export function getAgreementByVersion(version: string): AgreementDoc | undefined {
  return ALL_AGREEMENTS.find((a) => a.version === version);
}

export function getLatestAgreement(): AgreementDoc {
  return ALL_AGREEMENTS[ALL_AGREEMENTS.length - 1];
}
