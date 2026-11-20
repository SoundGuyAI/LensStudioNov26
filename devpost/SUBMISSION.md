# Devpost submission pack — Rehearsal Band

**Hackathon:** [Learn AR with SPECS (Round 2)](https://learn-specs.devpost.com/)  
**Deadline:** December 7, 2026 @ 5:00pm EST  
**Submit at:** https://learn-specs.devpost.com/ → *Enter a Submission*

Use this file as the source of truth when filling the Devpost form. Copy each section into the matching field. Replace every `TODO:` before you submit.

Planning doc already in this folder: [`design-brief.md`](./design-brief.md) (required by the skill pack / judges).

---

## Pre-submit checklist

- [ ] Repo is public **or** private on GitHub/GitLab and shared with `testing@devpost.com` **and** `jholmes@devpost.com`
- [ ] Repo root includes this `devpost/` folder with `design-brief.md`
- [ ] Repo includes full Lens Studio project files (`Assets/`, `Project.esproj`, etc.)
- [ ] Demo video is **public on YouTube**, under **3 minutes**, shows Lens Studio **preview** working
- [ ] Demo gets to the live Lens demo within the **first ~10 seconds**
- [ ] Gallery images uploaded (use the `preview-*.png` files in this folder)
- [ ] Built-with tags filled
- [ ] No copyrighted music / third-party trademarks in the video without permission
- [ ] All submission text is in English

---

## 1. Project name

```
Rehearsal Band
```

---

## 2. Tagline (one line)

Devpost usually wants a short elevator line under the title.

```
An AR host tool for improv workshops — agenda, timer, and scene suggestions live on your wrist, table, and wall.
```

Shorter alternate:

```
Keep your eyes on the group. Run the workshop from your wrist and the room.
```

---

## 3. Elevator pitch / short description

Paste into the short “about your project” / summary field (what it does, who it’s for, what you learned).

```
Rehearsal Band is a SPECS Lens for improv workshop hosts. Instead of looking down at a laptop for the plan, timer, and prompts, the host glances at a wristband for the current exercise and countdown, turns to a table-anchored suggestion card when they need a spark, and faces a wall agenda that marks where they are in the session.

It’s for facilitators who need their hands free and their eyes on the room — teaching, coaching, or running an open rehearsal.

Planning with the Devpost Learn skill pack forced the product into one clear spatial moment: glance the hand, turn to the table, face the wall. Building with CLAD in Lens Studio (SIK + UI Kit + LEAF) taught me that glasses UX is mostly about where content lives and when it gets out of the way — not packing a phone UI into the air.
```

---

## 4. Full project description (Devpost “About” / write-up)

Paste into the long description. Headings match the common Devpost structure.

### Inspiration

```
Improv hosts already juggle a plan, a timer, and “give me a suggestion” energy while staying present with the group. The usual tools — laptop, phone notes, printed agenda — pull eyes down and break the room’s focus.

Glasses are a better fit: the host keeps looking at people, and the workshop tools sit in the world where they belong — a glanceable band on the wrist, a prompt on the table, a full agenda on the wall.
```

### What it does

```
Rehearsal Band is a hands-free workshop host for SPECS:

• Wristband — current block + exercise name, countdown timer (M:SS), and a big Next control
• Palm menu — Suggestion, Start Timer, Reset Timer, Place Table, Place Wall
• Suggestion card — Location / Relationship / Word prompts on a table-height card; pinch to change
• Workshop Agenda — full session list on a wall panel, with ▶ marking the current exercise

Sample workshop plan (hard-coded for the preview):
1. Warm-up — Zip Zap Zop (3:00)
2. Warm-up — Yes And Circle (4:00)
3. Scene Work — Location Freeze (5:00)
4. Scene Work — Relationship Swap (5:00)
5. Showcase — Open Scenes (8:00)

The timer does not auto-advance the agenda. The host starts it when ready and pinches Next when the exercise is done. Place Table / Place Wall let the host re-anchor the UI on real surfaces in the room.
```

### How we built it

```
1. Plan — Ran the Devpost Learn plan-lens skill. It interviewed the idea, checked it against AR design rules (shared view, content in the world, hands free), and wrote the approved design brief in /devpost.
2. Build — An AI coding agent built the Lens in Lens Studio through CLAD and the Lens Studio MCP from that brief.
3. Interaction — Spectacles Interaction Kit (SIK) + UI Kit so pinches work in Interactive Preview (and on device later).
4. State — Modular TypeScript: session state, wristband / palm / suggestion / agenda UIs, surface placement, and audio feedback.
5. Verify — LEAF scenarios cover the design-brief done criteria (wristband visible, Next advances agenda, suggestion change, agenda visible).
```

### Challenges we ran into

```
• Designing for “look at the hand / table / wall” without real glasses — solved by anchoring UI in world space and proving the flow in Interactive Preview with mouse look + pinch.
• Keeping additive AR UI readable (dark content disappears on SPECS) — light text, large targets, glanceable labels.
• Separating host attention: wristband and palm stay with the hand; agenda and suggestions only compete when the host turns toward them.
• Surface placement UX: aim, then release pinch to confirm Place Table / Place Wall.
```

### Accomplishments that we're proud of

```
• A complete host product loop in preview — not just a floating panel: wrist → table → wall.
• Design brief done criteria mapped to LEAF tests.
• Content that stays out of the way until the host looks for it.
• A spatial story that wouldn’t be “just as good on a phone.”
```

### What we learned

```
• Good glasses design starts with one spatial moment, not a feature list.
• The skill pack’s questions (“Does it use what I’m looking at? Does it put something where it belongs? Does it free my hands?”) are a better filter than “can we render UI in AR?”
• Preview + LEAF can prove logic and placement; comfort on real SPECS is still “feel unproven” until worn.
• Agents are fast at building when the brief is specific about anchors, sizes (cm), and done criteria.
```

### What's next for Rehearsal Band

```
• Optional voice “next” with pinch always as fallback
• Swap the hard-coded plan/suggestions for a live workshop dashboard
• On-device pass for wristband comfort and real hand tracking feel
• Tutorial voiceover cues for first-time hosts
• (Future) shared session features — out of scope for this round
```

---

## 5. “Built with” tags

Add these in the Built With field (adjust to match Devpost’s tag picker):

```
Lens Studio
SPECS / Snap Spectacles
TypeScript
Spectacles Interaction Kit (SIK)
UI Kit
LEAF
CLAD
Lens Studio MCP
Cursor
Devpost Learn skill pack
```

---

## 6. Links (fill before submit)

| Field | Value |
|--------|--------|
| **Demo video (YouTube)** | `TODO: https://youtube.com/watch?v=________` |
| **Code repository** | `TODO: https://github.com/________/________` |
| **Try it out** | Lens Studio preview (SPECS Base Template project in the repo) — judges primarily use the video |

**Private repo reminder:** share with `testing@devpost.com` and `jholmes@devpost.com` before the deadline.

---

## 7. Gallery images

Upload the screenshots already in this folder. Suggested captions:

| File | Suggested caption |
|------|-------------------|
| `preview-near-suggestion.png` | Suggestion card at table height — Location / Relationship / Word prompts for scene work |
| `preview-look-suggestion.png` | Host view of the suggestion card in the rehearsal space |
| `preview-card-in-room.png` | Prompt card living in the room, not on a phone screen |
| `preview-after-room-switch.png` | UI re-anchored after Place Table / Place Wall |
| `preview-rehearsal-restored.png` | Full host setup restored — wrist controls + room anchors |

**Thumbnail tip:** Prefer a clear frame that shows the suggestion card or agenda in context (readable UI beats a distant wide shot).

---

## 8. Demo video — script & shot list (under 3:00)

**Rules from Devpost:** public YouTube; screen recording of Lens Studio preview; no copyrighted music you don’t have rights to; get to the demo fast.

### Recommended structure (~2:00–2:30)

| Time | What to show / say |
|------|---------------------|
| 0:00–0:08 | Title card: “Rehearsal Band — SPECS host tool for improv workshops” → cut straight into Interactive Preview |
| 0:08–0:25 | Problem in one sentence: “Hosts shouldn’t look at a laptop mid-rehearsal.” Show empty floor / host POV |
| 0:25–0:50 | Look at hand → wristband (exercise + timer) + palm menu |
| 0:50–1:10 | Pinch **Start Timer**; show countdown; pinch **Next** → agenda marker advances |
| 1:10–1:35 | Turn to table → suggestion card; pinch **New Suggestion** / card to change prompt |
| 1:35–1:55 | Face wall → Workshop Agenda with ▶ on current exercise |
| 1:55–2:15 | Optional: Place Table / Place Wall — aim, release pinch, show re-anchored UI |
| 2:15–2:30 | Close: who it’s for + “planned with Devpost Learn, built with CLAD” + repo mention |

### On-screen VO (optional, short)

```
Rehearsal Band puts the workshop on your glasses.
Glance your wrist for the exercise and timer.
Turn to the table for a suggestion.
Face the wall for the full agenda.
Eyes on the group. Hands free. Plan in the room.
```

### YouTube title / description

**Title:**
```
Rehearsal Band — SPECS AR Host Tool for Improv Workshops | Learn AR with SPECS
```

**Description:**
```
Demo of Rehearsal Band, a SPECS Lens built for the Learn AR with SPECS hackathon (Devpost).

Hosts run improv workshops with a wristband (exercise + timer + Next), a table suggestion card, and a wall agenda — without looking down at a laptop.

Built with: Lens Studio, CLAD, Lens Studio MCP, Spectacles Interaction Kit, UI Kit, LEAF.
Planned with the Devpost Learn skill pack (design brief in /devpost).

Hackathon: https://learn-specs.devpost.com/
Repo: TODO_REPO_URL
```

---

## 9. Judging criteria — talking points

Use these if Devpost asks free-text answers, or weave them into the write-up / video.

### Design
```
Complete host loop: advance exercises, time them, pull suggestions, see the full plan. Content is glanceable and spatially assigned (wrist / table / wall), not a website stuck to the face.
```

### Technical implementation
```
Planned with plan-lens → design brief. Built via CLAD + Lens Studio MCP. SIK/UI Kit interactions, modular TypeScript, LEAF scenarios for the brief’s done criteria. Runs in Lens Studio Interactive Preview.
```

### Innovation / idea
```
A real workshop-host job that phones interrupt. The novelty is the spatial product layout: status on the body, prompts on the table, plan on the wall — matching how hosts already move attention in a room.
```

### Presentation
```
Video opens on the working Lens in preview, walks the four done criteria, and closes with who it’s for and how the skill pack shaped the design.
```

---

## 10. Optional Devpost Q&A answers

If the form asks variants of these:

**Who is it for?**
```
Improv workshop hosts, teachers, and rehearsal facilitators who need the plan and prompts without looking away from the group.
```

**Why glasses (not a phone)?**
```
The host’s eyes should stay on people. The tools live in the room at real scale — wrist for status, table for suggestions, wall for the agenda — so hands stay free for directing and playing.
```

**How did the skill pack help?**
```
It forced one spatial moment, checked the idea against AR design rules, wrote done criteria we could test in preview, and kept scope honest (no multiplayer nameplates, no full web dashboard port).
```

**What did you learn?**
```
Glasses UX is placement and attention, not feature count. A sharp brief + CLAD beats a vague “build an AR app.” Preview proves logic; real SPECS still have to prove comfort.
```

---

## 11. Repo hygiene for judges

Confirm the public (or shared) repo contains at least:

```text
/
├── Assets/                 # Lens scripts, prefabs, materials, etc.
├── Project.esproj
├── devpost/
│   ├── design-brief.md     # required planning doc
│   ├── SUBMISSION.md       # this file (optional for judges, useful for you)
│   └── preview-*.png       # gallery / evidence screenshots
└── …
```

Judges are **not required** to clone and run the project — the **video** must show it working.

---

## 12. Final paste block (minimum submission)

If you’re short on time, these three fields are the required core:

**Name:** `Rehearsal Band`

**Description (short):**
```
Rehearsal Band is a SPECS Lens for improv workshop hosts. Glance a wristband for the current exercise and timer, turn to a table card for scene suggestions, and face a wall agenda that marks where you are — without looking down at a laptop. Built for facilitators who need eyes on the group and hands free. Planned with the Devpost Learn skill pack and built with CLAD in Lens Studio; I learned that good glasses design is one clear spatial moment, not a floating phone UI.
```

**Video:** `TODO: YouTube URL`  
**Repo:** `TODO: GitHub/GitLab/Bitbucket URL` (with `/devpost` + Lens Studio project)

---

*Round 2 · Learn AR with SPECS · https://learn-specs.devpost.com/resources*
