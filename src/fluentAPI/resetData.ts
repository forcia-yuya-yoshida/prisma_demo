import client from "../prismaClient";

export async function resetData() {
	try {
		await client.users.deleteMany();

		for (const _ of Array.from(Array(5))) {
			const user_id = crypto.randomUUID();
			await client.users.create({
				data: {
					user_id: user_id,
					name: "Test User",
				},
			});
			for (const _ of Array.from(Array(5))) {
				await client.posts.create({
					data: {
						user_id,
						post: "hogehoge",
					},
				});
			}
		}
	} catch (error) {
		console.error("❌ ERROR:", error);
		return { success: false, error };
	} finally {
		await client.$disconnect();
	}
}

if (import.meta.main) {
	await resetData();
}