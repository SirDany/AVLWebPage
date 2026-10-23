# AVL Studio

Independent artist portfolio and authenticated publishing studio. Next.js 16,
Payload 3, TypeScript, PostgreSQL (production), and SQLite (local development).
No public accounts, hosted-CMS requirement, or platform dependency for content.

## Included

- Branded responsive home, project collection/detail, journal, about, and contact.
- Draft/published projects and posts; upcoming and in-progress project statuses.
- Private owner-only previews and paginated project/journal archives.
- Sanctuary/gallery project layouts; rich text; galleries; click-to-load YouTube.
- Public file uploads and resource links with affiliate disclosures.
- Authenticated `/admin` with content management, commission switch, contact,
  social links, about/legal/privacy content, and newsletter settings.
- Audience list, cursor pagination, and unsubscribe controls in the admin dashboard.
  MailerLite must be configured; no fake data or success states.
- Per-page metadata, social previews, sitemap, robots, and locally hosted Roboto.
- Single-server Docker Compose deployment with PostgreSQL, uploads, Caddy HTTPS.

Sales, protected downloads, STL preview, social scheduling, campaign sending from
the admin, and consolidated analytics are **not implemented**. The authenticated
admin is the extension point; these are not misleading disabled menu items.

The supplied logos are included as JPEG-encoded copies and transparent,
original-colour display derivatives. Foreground violet, teal and gold RGB values
are preserved; only the pale neutral background is removed. The site provides
light surfaces around the logos instead of tinting them. Original attachments
are unchanged. Aquire and Cinzel are
not bundled: approved licensed webfonts have not been supplied.

## Local development (PowerShell)

Install Node **24.22.1 or newer** (24 LTS recommended). Then:

```powershell
npm ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in `PAYLOAD_SECRET` in `.env`. Leave
`DATABASE_URL=file:./avl.db`, `DATABASE_PUSH=true`, and
`SITE_URL=http://localhost:3000` for local development.

```powershell
npm run owner:create
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/admin`.
Owner creation runs on the server, not through public first-user registration.
The CLI can also reset an existing owner's password. Password input is hidden.
For non-interactive provisioning it accepts `AVL_OWNER_EMAIL`, `AVL_OWNER_NAME`,
and `AVL_OWNER_PASSWORD` through environment variables. Never place real
credentials in source control or command-line arguments. No default credentials exist.

Local SQLite schema push is **development only**. Do not enable automatic schema
push on a production database. Do not run multiple app processes against local
SQLite. Switching to PostgreSQL does not migrate local content automatically.

### Publishing

1. Sign in and open **Site & commissions**. Configure contact details, social
   channels, commission status/note, and about copy.
2. Upload media with descriptive alternative text. All media is **public**.
3. Create a project. The stable slug becomes `/work/<slug>`. Select project stage
   and layout, add a cover/gallery, optional story/video, and resource links.
4. Save drafts privately, then publish. The public site updates on the next
   request; no deployment is required. Set the optional actual completion date
   for completed work. Creation/publication dates are never used as substitutes.
5. Journal entries use the same draft/publish model. Publishing **never sends
   emails automatically**.
6. In **Site & commissions**, choose **Initial project** to set the expanded
   homepage project. Only published records are eligible.
   A deleted/unpublished choice falls back to the first eligible entry. The
   homepage loads at most 12 projects, including a configured target outside the
   first result page. Journal retains independent pagination.

### Presentation studies

Set `AVL_DEMO_CONTENT=true` in `.env` and restart the app to preview five original
digital form studies/variations and five sample journal entries. This mode is enabled in the
current local review environment; it defaults to **off** in `.env.example`.
These are labelled demonstration content, not completed physical projects.
They live outside the CMS and never insert or overwrite database records.

Real published projects replace the demonstration project collection; real
journal entries replace the sample journal collection independently.
The homepage is the project showcase, with optional completion dates and
plain-text upcoming/in-progress state. Journal is a separate chronological timeline.
Categories remain internal to the CMS, not public project-detail tags.
The retired `/work` archive, including old query parameters, permanently redirects
to `/`. Existing `/work/<slug>` project details and previews remain available.
Demo detail pages are marked `noindex` and never included in the sitemap.
If a real published slug matches a demo slug, the real record takes precedence.

Set `AVL_DEMO_CONTENT=false` and restart to remove all demo routes and content.
The original image assets remain publicly accessible as static files, but are
not protected downloads or content intended for sale. Empty pages stay quiet and
useful; disabled subscriptions do not display coming-soon panels.

White/off-white light transitions into violet across the homepage, with different
tonal treatments for project details, About, journal and contact. Logo colours do not change
between these surfaces. The footer contains only copyright, legal/privacy and
configured social links; owner access is directly through `/admin`, not a public
navigation link.

The homepage presents one image-led project in an offset orbital composition.
Hover and wheel, horizontal
drag/swipe, node buttons or keyboard arrows/Home/End change selection. Only
neighbouring nodes are drawn to keep dense collections usable; the counter shows
the full available selection. Wheel input is normalized and rate-limited.
Selection loops indefinitely in both directions, including across the first/last
boundary; it never rotates automatically. Small collections have no duplicate
controls, and a single project does not spin. Scrolling outside the selector and
vertical touch scrolling remain native.
The selected title/artwork opens its detail page.

Mathematical background traces settle within five seconds of arrival or
selection. There is no Pause motion button or homepage closing navigation block.
Reduced-motion preferences remove decorative animation and selection transitions.
Fine white, teal and gold stardust responds to artwork/node hover and selection,
with at most 64 particles living for less than two seconds. Animation frames run
only while particles remain; hidden pages and reduced-motion mode clear them.
Reduced-motion mode retains static hover light instead of travelling particles.
The public footer follows long content and reaches the viewport bottom on short
pages without being fixed over content.

Original synthesised hover, activation and selection hums are enabled by
default. A mute control remembers an explicit preference locally and silences
active sounds immediately. There is no soundtrack or ordinary page-scroll audio.
Browser autoplay restrictions may block hover/wheel audio until the first
qualifying click, tap or keypress. Blocked sounds are not queued or replayed.
Soft attacks and long harmonic tails replace short chirps. Each hum layers three
quiet sine tones, with low fundamentals and a faint activation overtone.
Rapid interactions are rate-limited, with at most nine simultaneous oscillators
(three layered hums); new effects are omitted while that limit is reached.
No external 3D engine, remote artwork or third-party animation runtime is loaded.

To regenerate the original procedural WebP studies and transparent logo
derivatives with the already-installed Sharp dependency:

```powershell
node scripts\generate-studies.mjs
```

The Vesper demonstration includes original alternate-view/detail/construction
images, process sections, an original four-second MP4/WebM film, two-page PDF notes
and an illustrative STL token. These are working public downloads, not paid
assets or validated fabrication instructions. Its completion date describes the
digital study, not a physical costume. Demo tool/material links are not affiliate
relationships; real configured affiliate links still render their disclosure.

To regenerate the original film using a local browser's Canvas/MediaRecorder:
install FFmpeg (or set `FFMPEG_PATH` to its executable), run
`node scripts\generate-study-film.mjs`, open `http://127.0.0.1:4319`, and press
the generation button. The loopback-only helper closes after saving or times out
after two minutes. It records the original WebM and creates a broadly compatible
H.264 MP4, served first by the public video player. This is an authoring utility,
not part of the deployed site; deployment does not need FFmpeg.

The homepage deliberately does not use the earlier tagline/introduction as a
marketing hero. Project titles and artwork lead; longer copy belongs in project
stories or the editable About content.

## Newsletter

Create a MailerLite account, verify the sending domain, create an audience group,
and configure **double opt-in for API/integration subscriptions in MailerLite**.
Test a fresh subscription, confirmation email, confirmation link, unsubscribe,
and suppressed address before enabling public signup. Provider approval, free
plan limits, and API entitlements must be checked on the actual account.

Set `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`, and only after the above test set
`NEWSLETTER_DOUBLE_OPT_IN_CONFIRMED=true`. Publish a reviewed privacy notice, then
enable **Newsletter enabled** in site settings.

The public form requests consent and delegates subscriber records, confirmation,
delivery, and unsubscribe processing to MailerLite. The admin dashboard displays
subscribers and can unsubscribe an active address. API keys never reach clients.
Campaign composition/sending is still done in MailerLite; an integrated campaign
approval/sending workflow is future work, not a feature of this release.

The application limits signup attempts per IP in a single process and fails
closed when its bounded rate-limit store is full. The supplied proxy overwrites
`X-Real-IP`; do not enable `TRUST_PROXY` when the app can be reached directly.
This limiter resets on restart and is not distributed. Add edge-level bot
protection and a durable limiter before running replicas or high-volume signup.

Transactional password-reset email is intentionally disabled rather than logged
as if delivered. Use the owner CLI until an actual email adapter is configured.

## Single-server production deployment

Docker Engine and Compose, a server with persistent disk, DNS pointed to that
server, and ports 80/443 are required. Start with approximately 2 GB RAM for
runtime; builds may need more. Hosting and domain costs are separate from future
payment fees. This is not an assertion of free production hosting.

1. Copy `.env.example` to `.env` on the server.
2. Set unique `PAYLOAD_SECRET` and `POSTGRES_PASSWORD`. Use a hex database
   password so it is safe inside the database URL.
3. Set `SITE_URL=https://<domain>` and `SITE_HOST=<domain>`.
4. Build and start the database, run migrations, and create the owner:

```powershell
docker compose build
docker compose up -d database
docker compose run --rm app npm run migrate
docker compose run --rm app npm run owner:create
docker compose up -d
docker compose logs --tail 100 app proxy
```

Caddy obtains HTTPS certificates. Only Caddy exposes network ports; the database
and app have no published ports. Uploads and database files use named volumes.
The app runs as a non-root user. App startup applies committed migrations.

Before launch, configure final content and legal identity, review privacy and
affiliate notices for the applicable jurisdiction, test uploads/downloads and
commission behavior, and verify HTTPS and newsletter confirmation. Do not launch
with the explicit unpublished legal/privacy placeholders.

### Schema changes

For PostgreSQL schema work, point `DATABASE_URL` at a development PostgreSQL
instance, keep `DATABASE_PUSH=false`, then:

```powershell
npm run generate
npm run migrate:create -- descriptive-name
npm run migrate
```

Commit generated migration SQL/TypeScript and snapshots. Test migrations against
a restored backup before applying to production. Never run destructive migration
rollback commands on live data without a recovery plan.

### Backups

Docker volumes are persistence, **not backups**. Schedule encrypted, off-server
PostgreSQL dumps and upload-volume backups. Back up `.env` separately and
securely. Stop writes or take coordinated snapshots when backing up both stores;
restore both to a test server and verify project images and links periodically.
Keep the previous application image and a database backup before upgrading.

## Verification

```powershell
npm run generate
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
docker compose config --quiet
```

Tests use an isolated SQLite database and upload directory under ignored
`test-results`, never the configured development or production database.
Three canonical test themes: studio/access (real Payload operations), newsletter
(provider behavior and validation), and public presentation.

The production dependency audit has no high/critical findings after updating Next,
Sharp, Sass, and DOMPurify. A moderate advisory remains in the obsolete esbuild
development-server dependency inherited through Payload's Drizzle migration
tooling; npm reports its parent packages too. Do not expose development tooling
or run dev mode in production. Recheck `npm audit` when upgrading; no unsafe
major-version overrides were used to hide this upstream issue. The development
lint toolchain additionally inherits an unpatched high-severity `braces`
stack-exhaustion advisory through Next's ESLint plugin. Production images prune
development dependencies; do not expose any development tooling.
