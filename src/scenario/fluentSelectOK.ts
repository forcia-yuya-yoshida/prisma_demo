import client from "../prismaClient";

export async function fluentSelectOK() {
	try {
		const users = await client.users.findMany();

		// イテレータ内でバッチ処理できる場合は、処理される
		await Promise.all(
			users.map(async (user) => {
				await client.users
					.findUnique({ where: { user_id: user.user_id } })
					.posts();

				// 前の処理がバッチ処理できた場合は、次の処理もバッチ処理される
				await client.users
					.findUnique({ where: { user_id: user.user_id } })
					.posts();

				await client.posts.findMany({
					where: { user_id: user.user_id },
				});
			})
		);
	} catch (error) {
		console.error("❌ ERROR:", error);
	} finally {
		await client.$disconnect();
	}
}
