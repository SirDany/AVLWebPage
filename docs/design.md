# AVL: portfolio and studio

## Approved direction

Independent, self-hostable artist hub. Sacred futurism: sanctuary atmosphere,
editorial restraint, and straightforward project browsing. Preserve the supplied
AVL emblems. Finished work leads; stories and technical resources follow.

Next.js, TypeScript, and Payload provide one application and authenticated admin.
Public visitors have no accounts. One owner controls content and settings.
PostgreSQL and persistent uploads run alongside the application on one server.
SQLite is supported for a single-process local development environment.

## First implementation

- Public home, project index/detail, journal index/detail, about, and contact.
- Project drafts, published work, upcoming work, curated layouts, rich text,
  galleries, click-to-load YouTube embeds, and public downloads/affiliate resources.
- Payload admin: project/journal/media management and global site controls.
- Commission availability and contact/social configuration in global settings.
- Newsletter signup through a configured provider, with confirmation and
  unsubscribe processing delegated to the provider. Subscriber administration
  stays inside the authenticated admin through a protected integration.
- No payments, customer accounts, social publishing, or analytics orchestration
  in this release. Future integrations must preserve the central workspace.
- No fake sales controls, fabricated testimonials, or invented completed projects.

## Boundaries

Only authenticated administrators can write. Public queries explicitly enforce
published-only access, including Payload Local API calls. Media is public and
must never hold paid downloads or secrets. Owner creation is a local CLI action;
public first-user registration is disabled.

Secrets stay server-side. Public forms validate input, report integration errors,
and do not claim delivery without provider acceptance. Newsletter consent is
separate from commission contact. Marketing delivery is not a home-built SMTP
bulk sender. External video loads only after visitor interaction.

Publishing is dynamic in this first release, so changed commission settings and
published content do not require rebuilding. A deployment requires HTTPS,
private database networking, persistent volumes, migrations, and off-server
backups. No claim of permanent free hosting or universal social-platform APIs.

## Done looks like

1. Visitors can browse published projects and journal entries but cannot read drafts.
2. An owner can manage projects, media, journal entries, and commission settings.
3. Invalid or unconfigured subscriptions report an error, not false success.
4. Unauthenticated callers cannot manage subscribers or create content/users.
5. Public pages render the supplied branding and accessible responsive navigation.

## Acceptance tests

1. `tests/studio.test.ts`: published content remains public and drafts stay private.
2. `tests/studio.test.ts`: an authenticated owner can publish a project and change commission availability.
3. `tests/newsletter.test.ts`: invalid/unconfigured submissions fail and confirmed provider acceptance succeeds.
4. `tests/studio.test.ts`: unauthenticated callers cannot write or access audience data.
5. `tests/site.test.tsx`: public pages expose the brand and navigation with usable empty states.

Browser checks supplement these tests for real rendering, mobile overflow, admin
login, and configured/unconfigured service feedback. There are no existing tests
to merge. Each new test file owns a distinct theme.

## Deferred decisions

Domain, production server, newsletter credentials and sender verification,
legal identity/jurisdiction, final copy, licensed font files, and real project
photography must be supplied before public launch. The app must not imply these
are configured. Payments require a separately approved commerce design covering
tax, licenses, refunds, and protected file delivery.
