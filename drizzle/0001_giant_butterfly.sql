CREATE TYPE "public"."difficulty" AS ENUM('Easy', 'Medium', 'Hard');--> statement-breakpoint
CREATE TYPE "public"."habitStatus" AS ENUM('skipped', 'done', 'planned');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('FREE', 'PAID');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_statuses" (
	"id" text PRIMARY KEY NOT NULL,
	"habitId" text NOT NULL,
	"date" timestamp NOT NULL,
	"status" "habitStatus" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habits" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "userRole" DEFAULT 'FREE';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_statuses" ADD CONSTRAINT "habit_statuses_habitId_habits_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
