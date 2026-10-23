# AVL celestial homepage and focused archives

## Direction and precedence

This revision supersedes the vertical homepage exhibition and asymmetric Work
exploration from the preceding design documents. Original logo colours,
light-to-violet gradients, direct-URL studio access and the restrained footer
remain unchanged.

The user approved two independent offset orbital selectors and subsequently
requested game-menu interaction sounds enabled by default. Sound must respond
to interaction, not play as a soundtrack.

## Homepage composition

Present a single composed stage on desktop with one selected project and one
selected journal entry visible simultaneously. The project is image-led; the
journal is quieter, with a date, title and short excerpt. Their silhouettes,
scale and rhythm differ without separating them into consecutive full-screen
exhibitions.

Each selection has its own offset, partial celestial gear: fine arcs, connecting
lines and small nodes representing entries. Only the selected entry expands.
Other entries remain compact selectable nodes. Selecting an entry does not
automatically navigate; its expanded presentation links to its detail page.
There is no automatic selection rotation.

Two complete circular dashboards were considered but would dominate the work.
A shared orbit was considered but would obscure the independence of project
and journal selection. The approved offset partial arcs preserve that distinction
with less visual weight.

On narrow screens, stack two compact instruments rather than compressing both
into unreadable circles. Do not restore the old sequence of giant project scenes.
Respect long titles, missing cover images, single-item collections and empty
collections. With JavaScript unavailable, the initially selected content and
ordinary detail links must remain usable.

## Selector interaction

- Hovering a gear and using the mouse wheel advances that gear alone.
- Accumulate and normalize wheel input so trackpads do not skip many entries.
- Keep selection bounded, with snapping and page scrolling released at either
  end. Outside the gear, page scrolling remains native.
- Mobile horizontal drag/swipe advances the selection; vertical movement remains
  available for page scrolling. Distinguish dragging from activating a node.
- Nodes are real labelled controls. Keyboard arrows, Home and End provide
  equivalent selection; focus is visible and does not jump unexpectedly.
- Announce the selected item accessibly without repeatedly announcing animation.
- Rapid inputs do not leave old content active or navigate to the wrong item.

## Atmosphere and motion

Use sparse, meaningful mathematical linework and formulas as background details.
They trace and fade behind the content, never as the primary attraction. Use
deliberate formulas rather than random pseudo-scientific strings.

Brief decorative sequences on arrival and user selection settle within five
seconds. Gear transitions are user-driven. Reduced-motion mode keeps content
and controls usable with static backgrounds and immediate selection changes.

Remove the Pause motion button and its obsolete pause state/styles. Do not move
it elsewhere. Original logo foreground colours must not be altered by filters,
opacity, recolouring or blend modes.

## Interaction audio

Sound is enabled by default; an opt-in gate is not part of the design. Provide
a small, accessible mute/unmute control and persist an explicit mute preference
locally. There is no continuous music or ambient soundtrack.

Use original, quietly synthesised sounds with separate character for hover,
activation and selection detents. Gear wheel and drag sounds correspond to
actual selection movement, not every raw browser event. Ordinary document
scrolling stays silent. Rate-limit hover and detent sounds and limit overlapping
voices so fast pointer/trackpad input cannot produce a burst of loud audio.

Browser autoplay policies still apply: hover and wheel alone do not reliably
unlock an AudioContext. Attempt playback when permitted; unlock/resume on a
qualifying click, tap or keypress. Do not queue blocked sounds for later replay.
Do not claim audio is playing while the browser blocks it, and do not treat this
expected browser state as a page error. Unexpected audio failures should be
reported once without breaking navigation.

Mute silences active voices immediately. Audio is supplementary: every action
has equivalent visual feedback. No additional audio dependency or third-party
sound files are needed.

## Work and Journal archives

Work becomes a stylistic but straightforward image/title grid. Display a
completion date only when supplied for completed work; never substitute creation
or publication dates. Include upcoming and in-progress projects, with restrained
plain-text state where necessary, not category tabs or tag pills.

Journal becomes a dated chronological timeline. Retain pagination, published-only
visibility, empty states and working detail links on both archives.

## Publishing controls and data flow

Add optional project completion date to Projects. Add optional initial-project
and initial-journal relationships to Site settings, with published-only choices
in the admin interface.

Resolve initial selections on the server using public published-only access.
An unpublished, deleted or unavailable configured record cannot expose private
content. Fall back to the first eligible record. A valid configured record must
be included even when it lies beyond the first archive page.

Load a bounded initial collection for each selector; include a configured
published target when necessary rather than fetching every record without a
limit. Archive pagination remains independent of this homepage selection.

Keep demo fallback independent for projects and posts: real published records
replace their corresponding sample collection. Demo initial focus uses its
deterministic default rather than fake CMS relationships. Samples remain
explicitly identified, noindex on detail routes and excluded from the sitemap.

Generate schema types and an additive production PostgreSQL migration. Do not
rewrite the original migration or reset the existing local database.

## Project details and demonstration content

Remove public category/status tag pills. Preserve stage data needed for upcoming
work and admin publishing; do not invent a new public taxonomy.

Expand one clearly identified digital demonstration into a complete presentation:

- Multiple finished views, close-ups and process images.
- Structured writing about the concept, design decisions and making process.
- A working original sample video, without pretending unrelated footage is AVL's.
- Working original sample PDF and STL downloads, clearly illustrative rather
  than fabrication-ready physical-project deliverables.
- Tools/material links and affiliate disclosure treatment without invented
  affiliate relationships or claims.

Add enough distinct demo projects and journal entries to make both selectors
meaningful, including upcoming work. Do not fabricate physical accomplishments.
Preserve real CMS gallery, rich-text, video and resource functionality.

Paid checkout, entitlement delivery, a 3D STL viewer and social orchestration
remain future work; this revision must not introduce fake versions of them.

## Layout cleanup

Delete the entire homepage All work/Contact closing block, without relocating it.
Preserve the normal header navigation and existing project-detail navigation.

Make the public page shell fill the viewport with a flex layout so the actual
footer reaches the bottom on short pages. It is not a fixed overlay and follows
long content naturally. Preserve the absence of footer branding and studio links.

Replace obsolete scene/scroll/pause styles and components as their consumers
change; avoid stacking another conflicting visual override layer.

## Verification

Use existing canonical public-site and studio tests, revising superseded
homepage/Work expectations rather than retaining contradictory tests. Cover
published-only initial focus, completion dates, sample fallbacks, rich detail
resources and the explicit removals.

Browser verification must exercise independent wheel, touch and keyboard
selection, native page scrolling outside selectors, audio activation/muting
under browser policy, reduced motion, and short/long page footer placement.
Check desktop and narrow mobile widths, meaningful contrast, original logo
colours, working downloads/video and absence of horizontal overflow.

Run lint, type checking, tests, production build and formatting checks. Verify the
additive migration against an isolated PostgreSQL database if a suitable local
instance is available; report any unverified deployment surface explicitly.
