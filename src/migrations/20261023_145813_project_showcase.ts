import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_initial_post_id_posts_id_fk";
  
  DROP INDEX "site_settings_initial_post_idx";
  ALTER TABLE "site_settings" DROP COLUMN "initial_post_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "initial_post_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_initial_post_id_posts_id_fk" FOREIGN KEY ("initial_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_initial_post_idx" ON "site_settings" USING btree ("initial_post_id");`)
}
