import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";

const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
const pool = postgres(connectionString, { max: 1 });

export const db = drizzle(pool);

export const userRoleEnum = pgEnum("userRole", ["FREE", "PAID"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").default("FREE"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"]);

export const habits = pgTable("habits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Habit ID
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to the user
  name: text("name").notNull(), // Habit name
  difficulty: difficultyEnum("difficulty").notNull(), // Enum for difficulty (Easy, Medium, Hard)
  color: text("color").notNull(), // Color string
  icon: text("icon").notNull(), // Icon identifier (e.g., FaDumbbell)
  frequency: text("frequency").array().notNull().default([]),
  createdAt: timestamp("createdAt").defaultNow(), // Creation date
});

export const habitStatusEnum = pgEnum("habitStatus", [
  "skipped",
  "done",
  "planned",
]);

export const habitStatuses = pgTable("habit_statuses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Status ID
  habitId: text("habitId")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }), // FK to the habit
  date: date("date", { mode: "date" }).notNull(), // Date for which the status is tracked
  status: habitStatusEnum("status").notNull(), // Status (done, skipped, planned)
});
