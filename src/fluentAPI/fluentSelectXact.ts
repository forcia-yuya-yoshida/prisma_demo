import client from "../prismaClient";

export async function fluentSelectXact() {
	try {
		const users = await client.users.findMany();

		const queries = users.map((user) => {
			return client.users
				.findUnique({ where: { user_id: user.user_id } })
				.posts();
		})

		// イテレータ内の処理がバッチ処理できる場合は、処理される
		await client.$transaction(
			queries
		);

		// イテレータ内の処理がバッチ処理できない場合は、処理されない
		await client.$transaction([
				...queries,
				client.posts.create({data: {
					user_id: users[0].user_id,
					post: "hogehoge",
				}}),
				...queries
			]);

	} catch (error) {
		console.error("❌ ERROR:", error);
	} finally {
		await client.$disconnect();
	}
}

if (import.meta.main) {
	await fluentSelectXact();
}