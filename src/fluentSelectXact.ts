import client from "./prismaClient";

export async function fluentSelectXact() {
	try {
		const users = await client.users.findMany();

		// イテレータ内でバッチ処理できる場合は、処理される
		await client.$transaction(
			users.map((user) => {
				return client.users
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

await fluentSelectXact();
