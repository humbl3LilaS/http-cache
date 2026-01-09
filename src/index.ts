import { Hono } from 'hono'
import { db } from './db/bun-sqlite'

const app = new Hono()

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

app.get("/cached", async (ctx) => {
	const result = db.query("select 'This result is cached' as message;").get();

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

export default app
