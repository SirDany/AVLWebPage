# AVL immersive gallery revision

## Approved direction

Replace the promotional landing-page structure with an immersive installation.
The atmosphere comes from artwork, light, depth and pacing, not repeated
otherworldly slogans. Preserve the existing self-hosted application, CMS,
publishing permissions and practical project resources.

## Public experience

The entrance is a near-full-height artwork scene with a small AVL mark, quiet
navigation and a project title. No introductory pitch, dominant seal, mandatory
entrance interaction or loading sequence.

Further works appear as distinct compositions with asymmetric framing and
different scales. Three original abstract demonstration pieces establish the
initial visual rhythm: a mask study, a mechanical relic and a textile/form study.
They are presentation studies, not claims about completed physical artwork.
Concise journal fragments interrupt the sequence where relevant.

Project links retain conventional URLs and the existing detail structure:
finished artwork, details, optional process, and resources. Navigation, contact
and commission availability remain discoverable and keyboard accessible.
Subscriptions appear only when available; absent content does not produce
promotional filler. Remove repeated slogans from shared public chrome and
default presentation copy.

## Branding and motion

Prepare a transparent derivative of the supplied compact mark without changing
the original attachment. Inspect edges against the real dark background to avoid
white fringes or loss of fine details. A local gradient may support contrast.
Use the full seal sparingly, outside the main entrance composition.

Use lightweight layered artwork, CSS animation and small interaction components.
Slow lighting, modest depth and subtle pointer response support the work.
No heavy 3D engine, scroll hijacking, flashing, forced camera movement or
essential information hidden behind motion. Decorative layers ignore pointer
events and do not enter the accessibility tree.

Normal scrolling and direct links work without animation. Touch layouts do not
depend on hover or pointer tracking. Reduced-motion mode removes ambient movement,
pointer parallax and animated reveals; artwork and links stay visible.

## Demonstration content

Provide an explicit, documented opt-in demo mode, enabled locally for review.
Keep original abstract assets in the repository and demo records separate from
Payload content. Do not insert fabricated published records into the database or
overwrite owner settings. Disable demo mode by configuration without deleting or
modifying real content.

Demo projects and journal entries are visibly identified as studies or sample
content. Their detail routes resolve only while demo mode is enabled and are
excluded from search indexing and the sitemap. Real published content takes
precedence over demonstration content. With demo mode disabled and no content,
show a quiet, useful entrance and navigation, not invented projects or slogans.

## Scope and boundaries

This revision covers public presentation, shared public chrome, original demo
artwork/content and supporting configuration/documentation. It does not redesign
the admin, alter database schemas, add commerce or change newsletter delivery.
Preserve published-only public access, authenticated previews, commission
controls and explicit integration errors.

## Verification

Re-evaluate adjacent presentation tests rather than appending ticket-specific
files. Add one behaviour test for each outcome below in the existing canonical
test themes:

1. The homepage leads with artwork and concise identification rather than
   repeated promotional sections.
2. Demo content is explicitly identified, resolves only when enabled and cannot
   replace real published content.
3. Demo pages are excluded from indexing and sitemap output.
4. Disabled demo mode with no published content preserves useful navigation
   without fabricated work or promotional empty sections.
5. Unconfigured newsletter controls are omitted from the public presentation.

Browser validation additionally checks desktop and narrow mobile layouts,
working project/journal links, no horizontal overflow, keyboard access,
contrast and logo edges, real ambient motion, reduced-motion visibility and
absence of scroll interception. Run existing focused tests, lint, typecheck,
format checks and the production build for the final changes.
