import client from "../prismaClient";

async function find() {
	// findUnique: pkeyを指定する
	const result1 = await client.users.findUnique({
		// 特に指定がなければそのテーブルの全カラムを取得
		// select を指定すれば子要素も取得できる
		select: {
			user_id: true,
			name: true,
			users_detail: {
				select: {
					profile: true,
				},
			},
			posts: true,
		},
		where: {
			user_id: "nakanishi",
		},
	});

	console.log(result1);

	// findMany:
	const result2 = await client.users.findMany({
		where: {
			posts: {
				some: {
					post_id: undefined,
				},
			},
		},
		orderBy: { user_id: "asc" },
		take: 100,
		skip: 0,
	});

	console.log(result2);

	// fluentAPI: そのレコードの子要素を全部取得する
	const result3 = await client.users
		.findUnique({ where: { user_id: "tkoyama" } })
		.posts();

	console.log(result3);
}

await find();
