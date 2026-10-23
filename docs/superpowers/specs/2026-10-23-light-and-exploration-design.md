# AVL: light, original identity and natural exploration

## Approved visual correction

Preserve the original logo colours: violet, teal and gold. Do not recolour,
filter or reduce logo opacity. Transparent derivatives may remove the background
but must retain foreground colours. Keep original source copies unchanged.

Introduce broad white/off-white gradients rather than individual white logo
tiles. A luminous header dissolves into violet; artwork scenes alternate pale
light and darker space. About uses a light composition so the complete original
seal fits naturally. Journal, contact and project pages share this tonal range
without placing light text on light gradients. Preserve reduced-motion support,
keyboard navigation and normal scrolling.

## Work exploration

Replace the category tabs and repeated card grid with an asymmetric,
artwork-led sequence. Vary scale, placement and spatial framing. Project names
are direct links. Do not display category filters or discipline labels in the
discovery compositions; categories remain editable in the CMS and available in
technical project details. Retain existing published-content access, demo
labelling and real-content precedence.

Work lists all published projects in curated order, with accessible pagination
when necessary. Old category/stage query parameters no longer filter the public
Work presentation; page remains supported. Do not change repository filtering
helpers used elsewhere or remove internal classification fields.

## Footer and admin

Remove the large footer AVL wordmark and all public Studio login links.
Retain copyright, legal/privacy and configured social links without an empty
branding row. Direct `/admin` access and authentication remain unchanged.

## Implementation boundaries

Modify public presentation and asset generation only. No database schema change,
content migration, authentication change, package installation or new runtime
dependency. Update related documentation and existing public presentation tests.
Do not touch the unrelated SQL snapshot attached to the conversation.

## Done looks like / acceptance tests

Each outcome maps to one behaviour test in `tests/site.test.tsx`:

1. Footer exposes legal/social destinations without wordmark or admin link:
   `the public footer has no branding link or studio login`.
2. Work exposes project links without taxonomy controls, including old filtered
   URLs: `work is an unfiltered visual exploration with working project links`.
3. Public logo images use original-colour derivatives on light surfaces:
   `public branding retains the original logo colours`.

Keep the remaining public presentation tests and the existing studio/newsletter
tests, updating superseded Work-filter expectations in the same canonical file.
Test-file count remains three. Browser checks additionally verify actual logo
colours/edges, readable gradients, varied compositions, keyboard links,
reduced-motion behaviour, and no overflow at 320/390/1440 widths. Validate lint,
types, tests, formatting and the production build.
