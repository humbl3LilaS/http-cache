import { createMiddleware } from "hono/factory"
import { db } from "./db/drizzle";
import { blogPost } from "./db/schema";
import { sql } from "drizzle-orm";

interface TCheckCache {
	Variables: {
		"eTag": string;
		"lastModified": string;
	}
}
export const checkCache = <T extends { maxUpdate: string }>(etagController: () => Promise<T>) => createMiddleware<TCheckCache>(async (ctx, next) => {

	let etag: string = ""

	const result = await etagController();
	const lastModified = new Date(result.maxUpdate);
	etag = Bun.hash(JSON.stringify(result)).toString();

	const ifNoneMatch = ctx.req.header("If-None-Match");
	const ifModifiedSince = ctx.req.header("If-Modified-Since");

	if (ifNoneMatch === etag) {
		return ctx.body(null, 304);
	}

	if (ifModifiedSince) {
		const since = new Date(ifModifiedSince);
		if (!isNaN(since.getTime()) && since >= lastModified) {
			return ctx.body(null, 304);
		}
	}

	ctx.set("eTag", etag);
	ctx.set("lastModified", lastModified.toISOString())

	await next();
});
