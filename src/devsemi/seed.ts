import client from "../prismaClient";

async function seed() {
	// deleteMany
	await client.users.deleteMany();

	// create
	await client.users.create({
		data: {
			user_id: "tkoyama",
			name: "小山",
			users_detail: {
				create: {
					profile: "20期です",
				},
			},
			posts: {
				createMany: {
					data: [
						{
							post: "ウオウオ",
						},
						{
							post: "ウオウオウ",
						},
					],
				},
			},
		},
	});

	//crateMany
	await client.users.createMany({
		data: [
			{
				user_id: "kmuguruma",
				name: "六車",
			},
			{ user_id: "urakami", name: "浦上" },
		],
	});

	// upsert
	await client.users_detail.upsert({
		where: {
			user_id: "nakanishi",
		},
		create: {
			profile: "20期らしい",
			users: {
				connectOrCreate: {
					where: { user_id: "nakanishi" },
					create: { user_id: "nakanishi", name: "中西" },
				},
			},
		},
		update: { profile: "20期らしい" },
	});
}

await seed();
