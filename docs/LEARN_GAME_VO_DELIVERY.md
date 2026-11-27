# Learn Mode VO Delivery: Zip Zap Zop (Package F)

**Source of truth:** [`LEARN_GAME_FEATURE.md`](./LEARN_GAME_FEATURE.md). Style mirrors [`VOICE_TUTORIAL_HANDOFF.md`](./VOICE_TUTORIAL_HANDOFF.md).
**Scope:** VO assets only. No Lens scripts edited. `Assets/GeneratedSFX/` and `Assets/TutorialVO/` untouched.

## Layout decision

Output folder: `Assets/LearnGames/ZipZapZop/VO/`.
Reason: LEARN_GAME_FEATURE.md already puts per-game assets under `Assets/LearnGames/<Game>/` (Video/, Demo3D/). VO sits next to them, and future games get their own `VO/` folder. `Assets/TutorialVO/` stays reserved for the product onboarding set.

## Format

| Spec | Value |
|------|-------|
| Container | `.wav`, 44100 Hz, 16-bit PCM, mono |
| Voice | Gemini TTS, Sulafat (same host voice as the tutorial set) |
| Direction | Enthusiastic workshop host, warm, clear, slightly slower than podcast pace, audible smile |
| Headroom | Peak about -1 dB, 150-300 ms silence at each end |
| Playback intent | `Audio.PlaybackMode.LowPower` |
| Path style | `requireAsset("../LearnGames/ZipZapZop/VO/<FileName>.wav")` |

## Cue list

Wording follows the locked canonical rules: Zip, Zap, Zop energy pass, eye contact before sending, celebrate mistakes and restart from Zip, clarity before speed. The Zip Zap Zoop variant is not used.

| # | Filename | Target | Script | Pairs with teleprompter line |
|---|----------|--------|--------|------------------------------|
| 01 | `ZipZapZop_VO_01_Intro.wav` | 5-8 s | Zip Zap Zop. A quick circle warm-up for focus, eye contact, and shared energy. | (opening) |
| 02 | `ZipZapZop_VO_02_EnergyBall.wav` | 6-9 s | Stand in a circle. Picture a ball of energy in your hands. That's what you pass. | 1. Pass an energy ball |
| 03 | `ZipZapZop_VO_03_OneWord.wav` | 5-8 s | One word each pass. Say it as you send the energy across the circle. | 2. Say one word each pass |
| 04 | `ZipZapZop_VO_04_Zip.wav` | 4-6 s | The first player says Zip, and passes the energy to someone. | 3. Zip |
| 05 | `ZipZapZop_VO_05_Zap.wav` | 3-5 s | That person says Zap, and passes it on. | 4. Zap |
| 06 | `ZipZapZop_VO_06_Zop.wav` | 4-6 s | The next player says Zop. Then it's back to Zip. | 5. Zop |
| 07 | `ZipZapZop_VO_07_Cycle.wav` | 5-8 s | The order never changes. Zip, Zap, Zop, Zip, Zap, Zop. Keep the cycle going. | 6. Repeat the cycle |
| 08 | `ZipZapZop_VO_08_EyeContact.wav` | 6-9 s | Look first, then pass. Eye contact before the word. Receive before you send. | 7. Eye contact before you pass |
| 09 | `ZipZapZop_VO_09_Mistake.wav` | 5-8 s | If someone slips, cheer for it, and restart from Zip. No blame. | (coaching) |
| 10 | `ZipZapZop_VO_10_ClarityFirst.wav` | 6-9 s | Clear first, fast later. Keep the energy up. Never let it hit the floor. | (coaching) |
| 11 | `ZipZapZop_VO_11_Close.wav` | 3-5 s | That's Zip Zap Zop. Start from Zip whenever you're ready. | (close) |

Suggested `voCueIds` for the `zip_zap_zop` pack: the 11 filenames without `.wav`.

## References used

- https://allimprov.com/learn/games/zip-zap-zop/ (Zip to Zap to Zop cycle, eye contact before the word, receive before you send, acknowledge a mistake and restart)
- https://dbp.theatredance.utexas.edu/teaching-strategies/zip-zap-zop (energy passed with eye contact, resume after a mistake without discussion, "never hit the ground", steady rhythm)
- https://www.hooplaimpro.com/resource/zip-zap-zop (a slip is expected and does not matter, make eye contact with the passer)
- Not used: https://improwiki.com/en/wiki/zip-zap-zoop (variant rules).

## Delivery checklist

- [ ] `Assets/LearnGames/ZipZapZop/VO/` exists (see pending item below)
- [x] All 11 files generated with exact names
- [x] 44.1 kHz WAV, speech clear, no clipping
- [x] Scripts match the table exactly
- [x] Existing `TutorialVO/` and `GeneratedSFX/` unchanged
- [x] Results (generated Nov 27, 2026): voice Gemini TTS Sulafat, enthusiastic workshop-host direction. 11 files, 44.1 kHz mono 16-bit PCM, 200 ms lead-in and 250 ms tail, peak about -1 to -3 dB. Durations 4.0 s to 8.4 s each (01 is 6.2 s, 05 is 4.0 s, 07 is 8.4 s). Script deviations: none. Known quality issues: none measured; a listen-through in preview is still pending.
- [ ] WAVs committed to `Assets/LearnGames/ZipZapZop/VO/`. **Pending:** this repo tracks `*.wav` in Git LFS and the web uploader cannot push LFS files, so the 11 WAVs are delivered as `ZipZapZop_VO.zip` in a private Drive folder. Unzip into that folder and commit with Git LFS.
