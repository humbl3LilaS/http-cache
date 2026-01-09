import { seed } from "drizzle-seed";
import { db } from "./drizzle";
import { blogPost } from "./schema";

async function main() {
	await seed(db, { blogPost }).refine((_f) => ({
		blogPost: {
			count: 10
		}
	}))
}
try {

	await main();
} catch (error) {
	console.log(error)
}
