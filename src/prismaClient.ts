import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client with detailed query logging
const client = new PrismaClient({
	log: [
		// Log queries as events for detailed output
		{
			emit: "event",
			level: "query",
		},
	],
});

client.$on("query", (e) => {
	console.log(e.query);
});

export default client;
