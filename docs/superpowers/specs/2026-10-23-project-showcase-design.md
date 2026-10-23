# Project-only orbital showcase

## Approved direction

Replace the dual project/journal homepage with one focused project showcase.
The user chose to retire the separate project grid, not merely hide its header
link. This supersedes the dual-homepage and Work-grid requirements in the
celestial-menu specification. Journal remains an independent timeline and detail
area, reachable from the main navigation.

## Navigation and content

Remove Work from the header. Redirect the exact `/work` archive route to `/`,
including obsolete archive query parameters. Preserve `/work/<slug>` detail
routes, previews and publication rules. Change archive/back links in project
details, About and other directly related surfaces to the homepage, with
appropriate project/showcase wording. Remove the obsolete grid from the sitemap.
Do not introduce a replacement archive block.

The homepage contains project artwork, title, short description, optional
completion date or plain-text upcoming state, and its orbital selector.
Remove journal content and journal queries from the homepage. Keep the
initial-project setting and published-only fallback. Remove the obsolete
initial-journal admin field from the active schema, with an additive migration
for production; do not rewrite existing migrations or reset local data.
Journal publishing, archive ordering, subscriptions and existing content remain
intact. Existing newsletter eligibility rules remain unchanged.

Keep homepage selection bounded in data size as before (up to 12 published
projects including the configured target), rather than introducing unbounded
database reads. Infinite rotation describes interaction, not infinite content.

## Composition and looping

Use one full-width composed stage, not a stretched half-panel. The artwork is
primary, with restrained identification and an offset celestial orbit. Preserve
original logo colours, light/violet gradients and the proper short-page footer.
Do not add slogans, categories, a motion toggle or automatic selection rotation.

Wheel, horizontal drag/swipe and arrow keys cycle indefinitely in either
direction. The transition from last to first is the same directional step as
any other selection. Neighbouring nodes continue across the seam without jumping
across the arc. Node activation opens selection; the selected artwork/title
opens its detail page. Home/End still select the first/last entries explicitly.
Small collections must not produce duplicate controls or unstable keys.

Normalize trackpad input and rate-limit detents. Native scrolling outside the
instrument and vertical touch scrolling remain available. Zero and one project
states stay usable; there is no meaningful spin or selection sound for a
one-item collection. Keyboard focus and live announcements remain coherent.

A conventional full-width carousel was rejected as too ordinary. A free-spinning
3D scene was rejected as heavier and distracting from the projects themselves.

## Sacred interaction audio

Replace short, descending chirps with quiet layered resonances:

- Hover: low breath-like hum with a soft attack.
- Selection: deeper harmonic swell with a longer fading tail.
- Project/link activation: a faint celestial overtone over the resonance.

Use original Web Audio synthesis, without third-party recordings or a soundtrack.
Sounds remain enabled by default subject to browser activation policy. Preserve
mute preference and immediate silence on mute. Blocked audio is not queued.

Use conservative gain, limited overlapping voices, hover throttling and
selection coalescing so fast input never accumulates a loud continuous wash.
Disconnect completed audio nodes and report unexpected failures once without
breaking navigation. Visual feedback must remain sufficient without audio.

## Stardust interaction

Fine white, muted teal and gold particles gather around hovered artwork/nodes.
A sparse short-lived pointer trail and selection dispersal add atmosphere.
These are decorative, never hit targets, text obstructions, fireworks or a
replacement cursor.

Use a bounded particle count and animation-frame work only while particles are
alive. Stop and clean up when unmounted or hidden. Touch receives a brief
selection bloom without depending on hover. Reduced-motion mode uses static
light and no travelling particles or decorative transitions. All decorative
sequences settle within five seconds; there is no continuous ambient animation.

## Implementation boundaries and validation

Simplify the existing orbital component to its remaining project purpose,
rather than retaining unused journal variants. Reuse the existing sound
provider and published-only reader. Remove obsolete grid components/styles.
No new production dependency is required.

Revise the existing public-site and studio test files; keep newsletter tests
unless a directly coupled behaviour changes. Test-file budget remains three.

Acceptance outcomes:

1. Homepage shows projects only and header has no Work navigation item.
2. Exact archive URL redirects home; details remain reachable and return home.
3. Wheel/drag/keyboard cycle across both boundaries without wrong-detail links.
4. Configured published initial project is honoured; drafts remain private.
5. Audio uses soft layered envelopes and bounded overlap; mute stops it.
6. Stardust responds to interaction, settles, and respects reduced motion.
7. Desktop/mobile layouts remain legible, overflow-free and footer-safe.

Map these outcomes to behavioural tests in the canonical existing files and
real browser interaction checks. Run lint, types, tests, formatting and production
build. Generate and validate the schema migration against isolated PostgreSQL,
and document the revised navigation, looping and publishing controls.
