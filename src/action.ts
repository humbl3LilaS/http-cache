import { sql } from "drizzle-orm"
import { db } from "./db/drizzle"
import { blogPost } from "./db/schema"

export const extractBlogPostStats = async () => {
	const [data] = await db.select({
		maxUpdate: sql<string>`max(${blogPost.updatedAt})`,
		count: sql<string>`count(*)`
	}).from(blogPost)
	return data
}
