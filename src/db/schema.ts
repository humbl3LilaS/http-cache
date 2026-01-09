import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const blogPost = pgTable("blog_post", {
	id: integer().generatedAlwaysAsIdentity().primaryKey(),
	author: varchar().notNull(),
	content: text().notNull(),
	createAt: timestamp({ withTimezone: true }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow(),
})

