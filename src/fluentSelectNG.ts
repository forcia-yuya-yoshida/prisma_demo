import client from "./prismaClient";

export async function fluentSelectNG() {
	try {
		const users = await client.users.findMany();

		for (const user of users) {
			// イテレータ出ない場合は、処理されない
			await client.users
				.findUnique({ where: { user_id: user.user_id } })
				.posts();
		}

		// イテレータ内でバッチ処理できない処理が先にある場合は、処理されない
		await Promise.all(
			users.map(async (user) => {
				await client.posts.findMany({
					where: { user_id: user.user_id },
				});

				await client.users
					.findUnique({ where: { user_id: user.user_id } })
					.posts();
			})
		);
	} catch (error) {
		console.error("❌ ERROR:", error);
	} finally {
		await client.$disconnect();
	}
}

await fluentSelectNG();
