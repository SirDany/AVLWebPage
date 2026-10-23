import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "completed_at" timestamp(3) with time zone;
  ALTER TABLE "_projects_v" ADD COLUMN "version_completed_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "initial_project_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "initial_post_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_initial_project_id_projects_id_fk" FOREIGN KEY ("initial_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_initial_post_id_posts_id_fk" FOREIGN KEY ("initial_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_initial_project_idx" ON "site_settings" USING btree ("initial_project_id");
  CREATE INDEX "site_settings_initial_post_idx" ON "site_settings" USING btree ("initial_post_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_initial_project_id_projects_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_initial_post_id_posts_id_fk";
  
  DROP INDEX "site_settings_initial_project_idx";
  DROP INDEX "site_settings_initial_post_idx";
  ALTER TABLE "projects" DROP COLUMN "completed_at";
  ALTER TABLE "_projects_v" DROP COLUMN "version_completed_at";
  ALTER TABLE "site_settings" DROP COLUMN "initial_project_id";
  ALTER TABLE "site_settings" DROP COLUMN "initial_post_id";`)
}
