import { Hono } from 'hono'
import { db } from './db/drizzle'
import { blogPost } from './db/schema'
import { checkCache } from './middleware'
import { eq } from 'drizzle-orm'
import { extractBlogPostStats } from './action'

const app = new Hono()

app.get('/', (c) => {
	return c.text('Hello Hono!')
})



app.get("/cached", checkCache(extractBlogPostStats), async (ctx) => {
	const result = await db.select().from(blogPost);
	console.log(ctx.var);
	return ctx.json({
		result
	}, 200, {
		"Cache-Control": ["public", "max-age=0", "must-revalidate"],
		"ETag": ctx.var.eTag,
		"Last-Modified": ctx.var.lastModified
	})
})

app.post("/cached/:id", async (ctx) => {
	const id = ctx.req.param("id");
	const body = await ctx.req.json();
	const update = await db.update(blogPost).set({
		content: body.content ?? "Super Content",
		updatedAt: new Date(),
	}).where(eq(blogPost.id, parseInt(id))).returning();

	return ctx.json({
		update
	}, 200)
})

export default app
