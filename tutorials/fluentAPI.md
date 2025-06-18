このチュートリアルは、prisma 6.7 + PostgreSQL 16.8 で動作確認をしています。

## Fluent API について
prismaには [Fluent API](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#fluent-api) という機能があり、 `users.findUnique().posts()` のような記述で外部キーを張った子要素を取得することができる。

Fluent API　のメリットとして、[親のfindUniqueがイテレータで呼ばれていた場合クエリがバッチ処理される](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance#solution-1-batching-queries-with-the-fluent-api)というものがある。これによって、記述としては1件ずつselectするようになっていてもクエリ発行回数が抑えられ、n+1を回避できる。

ただし、　Fluent API　が適用できるクエリの前に　Fluent API　が適用できないクエリを発行してしまうと、全体にわたって Fluent API が適用されなくなるという性質がある。このチュートリアルはそれを確認するものである。


## 準備
データを整備する。
```
bun run src/scenario/resetData.ts
```

## Fluent API が適用される例
まずは適用されるクエリを実行する。
```
bun run src/scenario/fluentSelectOK.ts
```

`fluentSelectOK` では、取得したユーザーごとに以下のようなクエリが発行される。

```
// 1. postsに対して Fluent API を用いてpostsを取得
await client.users
	.findUnique({ where: { user_id: user.user_id } })
	.posts();

// 2. postsに対して Fluent API を用いてpostsを取得 (1. と同じ)
await client.users
	.findUnique({ where: { user_id: user.user_id } })
	.posts();

// 3. postsに対して Fluent API を用いずにpostsを取得
await client.posts.findMany({
	where: { user_id: user.user_id },
});
```

実行すると以下のようなクエリログが発行される。

```
SELECT "public"."users"."user_id", "public"."users"."name" FROM "public"."users" WHERE 1=1 OFFSET $1
SELECT "public"."users"."user_id" FROM "public"."users" WHERE "public"."users"."user_id" IN ($1,$2,$3,$4,$5) OFFSET $6
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1,$2,$3,$4,$5) OFFSET $6
SELECT "public"."users"."user_id" FROM "public"."users" WHERE "public"."users"."user_id" IN ($1,$2,$3,$4,$5) OFFSET $6
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1,$2,$3,$4,$5) OFFSET $6
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
```

1行目はループ外で発行された(usersを取得するための)selectで、2行目以降はループ内で発行されたselectである。

2-3行目、 4-5行目はそれぞれ 1. と 2. の処理の結果である。user_idでの絞り込みがin句にまとめられ、n+1が回避されていることがわかる。  
一方で6行目以降はuser_idの数だけクエリが発行されており、n+1の形になっていることがわかる。

`fluentSelectOK` では Promise.allで検証しているが、 `fluentSelectXact` の例のように prisma.$transaction などでも発火する場合がある。

## Fluent API が適用されない例
次に、適用されないクエリを実行する。
```
bun run src/scenario/fluentSelectNG.ts
```

`fluentSelectNG` では、取得したユーザーごとに以下のようなクエリが発行される。
```
// 1. for文で Fluent API を用いてpostsを取得
for (const user of users) {
	await client.users
		.findUnique({ where: { user_id: user.user_id } })
		.posts();
}

// 2. mapイテレータ内で、Fluent API を用いずにpostsを取得したあと、Fluent API を用いてpostsを取得
await Promise.all(
	users.map(async (user) => {
		await client.posts.findMany({
			where: { user_id: user.user_id },
		})
		await client.users
			.findUnique({ where: { user_id: user.user_id } })
			.posts();
	})
);
```

実行すると以下のようなクエリログが発行される。

```
SELECT "public"."users"."user_id", "public"."users"."name" FROM "public"."users" WHERE 1=1 OFFSET $1
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" = $1 OFFSET $2
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."users"."user_id" FROM "public"."users" WHERE ("public"."users"."user_id" = $1 AND 1=1) LIMIT $2 OFFSET $3
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
SELECT "public"."posts"."post_id", "public"."posts"."user_id", "public"."posts"."post" FROM "public"."posts" WHERE "public"."posts"."user_id" IN ($1) OFFSET $2
```

見てわかる通りどのクエリにおいてもバッチ処理はされておらず、n+1の形になっている。  
`fluentSelectOK` では先に Fluent API が適用できるクエリを実行した場合バッチ処理が適用されたが、後から実行した今回は適用されないということがわかった。

## 結果からわかること
Fluent API でバッチ処理されるか否かは、イテレータ内での記述順に依存する。  
そのため、 Fluent API が適用できるクエリと適用できないクエリを両方記述する必要がある、かつ取得順序を気にしなくても良い場合、 Fluent API が適用できるクエリを先に記述するべきである。