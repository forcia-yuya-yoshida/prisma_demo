# prisma-demo
※DBは各自で用意してください

To prepare:

```bash
bun install
bun prisma generate
```

To run:
```bash
cp .env.sample .env
bun prisma migrate reset
bun run src/index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
