## prismaってなに
- 主に2つの機能を提供する
  - prisma migrate: 安全なデータベースマイグレーション機能
  - prisma client: typescriptのDBクライアント機能

## prismaの便利な点
- prisma client
  - DBのデータを型安全にtypescriptで表現できる ← これが一番大きい
  - 宣言的にクエリを書くことができる
    ```
  	const result1 = await client.users.findUnique({
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
    ```
- prisma migrate
  - DBの変更履歴を管理できる
## どうやって？
- prismaは独自のDSLでDBを表現している(schema.prisma)
- schema.prisma → DB (prisma migrate)
- schema.prisma → typescript (prisma client)

## 講義の目的
- schema.prismaを書く
- prisma migrateを使う
- prisma clientを使う

## データモデルを schema.prisma で表現する

### シナリオ: Twitter
1. ユーザーがIDと名前を登録する
1. ユーザーがプロフィールを編集する(任意)
1. ユーザーが投稿する

データの例としてはこんな感じ(カラムは全部必須とする)

users: ユーザー
| 物理名 | 論理名 | 型 | ID |
|-------------|------------|------|------|
| `user_id` | ユーザーID | text | ○ |
| `name` | ユーザー名 | text |  |

users_detail: ユーザー詳細
| 物理名 | 論理名 | 型 | ID |
|-------------|------------|------|------|
| `user_id` | ユーザーID | text | ○ |
| `profile` | 自己紹介 | text |  |
usersとusers_detailは1対1

posts: 投稿
| 物理名 | 論理名 | 型 | ID |
|-------------|------------|------|------|
| `post_id` | ユーザーID | text | ○ |
| `user_id` | ユーザーID | text |  |
| `post` | 投稿 | text |  |
usersとpostsは1対多
投稿の度に自動でIDを割り振りたい

### 1. users, users_detail, posts をschema.prismaに記載する

```
model users {
  user_id String  @id
  name    String
}

model users_detail {
  user_id String  @id
  profile    String
}

model posts {
  post_id String     @id @default(uuid())
  user_id String
  post    String
}
```

必要な情報は網羅できていそう

schema.prismaが正しい状態かチェックしてみる

`bun prisma format`

### 2. モデル間の依存関係を記述する

- `users_detail.user_id` から `users.user_id` は一対一
- `posts.user_id` から `users.user_id` は一対多

イメージはこう

```
model users {
  user_id String  @id
  name    String
  users_detail users_detail?
  posts posts[]
}
```

`users` を↑のように書き換えて format してみると…

なんか勝手に色々追加された

解説
```
users_detail @relation(fields: [users_detailUser_id], references: [user_id])
```
これは「自分の `users_detailUser_id` から、 相手の `users_detail.user_id` に外部キーを貼ります」という意味になります

それはやめてほしい

- @relation は 子要素側に設定する
- fields （自分の外部キー） を適切に設定する

```
model users {
  user_id             String        @id
  name                String
  users_detail        users_detail?
  posts               posts[]
}

model users_detail {
  user_id String  @id
  profile String
  users   users @relation(fields: [user_id], references: [user_id])
}

model posts {
  post_id      String  @id @default(uuid())
  user_id      String
  post         String
  users        users  @relation(fields: [user_id], references: [user_id])
}
```

こう書き換えて、有効かチェック

## Prisma Migrate について
だいたい3つ覚えておけばよい
- `prisma migrate reset`
  - DBを初期化し、 `prisma/migrations` 配下のsqlを実行する
  - 文字通り環境の初期化のために実行する
- `prisma migrate deploy`
  - DBのmigration履歴と `prisma/migrations` 配下のsqlを突き合わせ、未実行のsqlを実行する
  - 商用環境にmigrationを適用するために実行する
- `prisma migrate dev`: 2つのことをやっている
  - schema.prismaとmigration配下のsqlから差分を抽出し、差分を埋めるようなsql文を生成する
  - 生成された差分をDBに適用する。直接適用できる場合は適用し、適用できない場合はDBを初期化する
  - migrationファイルを作成するために実行する

### 完成したschema.prismaからmigrationを作る

`bun prisma migrate dev`

migrationに名前を付けろと言われるので、名前を付ける

### schema.prismaを変更したい
- このままだとユーザーを削除できずに困るので、修正したい
- 修正プラン
  - まだmigrate deployしていない場合: 生成されたmigrationを消して、作り直す
  - migrate deployしている場合: 新しいmigrationを作る
    - migrate deploy時の比較はmigrationの名前だけしか見ない
- 今回は新しく作ってみる

こんな感じでcascade delete設定を追加
```
  users   users  @relation(fields: [user_id], references: [user_id], onDelete: Cascade)
```

`bun prisma format` → `bun prisma migrate dev`

新しく生成されたmigration.sqlを確認する

### 注意
- データによってエラーになるDDLを生成する場合は注意(必須カラムを追加したいケースなど)

## Prisma Client について
まずはschema.prismaから型定義を作る

`pnpm prisma generate`

### seedスクリプトを作る
seed: DB初期化時に登録するデータ

`bun run src/devsemi/seed.ts` を実行してみる

- `create`: 1件だけ作る
- `createMany`: 複数件作る
- `upsert`: upsertする、createとupdateの両方が必要
  - `connect`: 既存のレコードに紐づける
- (書いてないけど)  `update` も似たような感じでできます
  - `upsertManyはない`


package.jsonに以下を追記しておけば `prisma migrate reset` 後に自動的に実行される
```
"prisma": {
  "seed": "bun run src/devsemi/seed.ts"
}
```

### 検索クエリ
`bun run src/devsemi/find.ts` を実行してみる

- `findUnique`: pkey指定で1件のみ取得
- `findMany`: 条件を指定して複数件取得
- fluent API: 取得したレコードの子要素を取得
