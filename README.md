# prisma-demo

## 準備
※devcontainer環境を提供していますが、利用できない場合はbunとDBを各自で用意してください。

DBへの接続情報は .env(.sample) に記載されています。デフォルトでは `psql -h localhost -U postgres prisma_demo` で接続できる環境があればよいです。

以下はdevsemi環境での動作確認コマンドです。

```bash
bun install
bun prisma generate
cp .env.sample .env
createdb prisma_demo
bun prisma migrate reset
```

## チュートリアル
`tutorials` 配下のmdファイルを参照してください。



This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
