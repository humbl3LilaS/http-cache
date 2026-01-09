import { Hono } from 'hono'
import { db } from './db/drizzle'
import { blogPost } from './db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono()

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

app.get("/cached", async (ctx) => {
	const result = await db.select().from(blogPost);

	const lastModified = new Date();

	const etag = Bun.hash(JSON.stringify(result)).toString();

	const ifNoneMatch = ctx.req.header("If-None-Match");
	const ifModifiedSince = ctx.req.header("If-Modified-Since");

	if (ifNoneMatch === etag) {
		return ctx.body(null, 304);
	}

	if (ifModifiedSince) {
		const since = new Date(ifModifiedSince);
		if (!isNaN(since.getTime()) && since >= lastModified) {
			return ctx.body(null, 304)
		}
	}

	return ctx.json({
		result
	}, 200, {
		"Cache-Control": ["public", "max-age=0", "must-revalidate"],
		"ETag": etag,
		"Last-Modified": lastModified.toUTCString()
	})
})

app.post("/cached/:id", async (ctx) => {
	const id = ctx.req.param("id");
	const body = await ctx.req.json();
	const update = await db.update(blogPost).set({
		content: body.content ?? "Super Content"
	}).where(eq(blogPost.id, parseInt(id))).returning();

	return ctx.json({
		update
	}, 200)
})

export default app
