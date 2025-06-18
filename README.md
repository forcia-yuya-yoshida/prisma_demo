# prisma-demo
※devcontainer環境を提供していますが、利用できない場合はbunとDBを各自で用意してください

To prepare:

```bash
bun install
bun prisma generate
cp .env.sample .env
createdb prisma_demo
bun prisma migrate reset
```

To run:
```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
