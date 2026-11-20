# renon-dev

The next version of [renon.dev](https://renon.dev): a cinematic, scroll driven one page portfolio for Renon Reis, Senior Software Engineer and Tech Lead (TypeScript, React, Next.js, Node.js). Static, bilingual (English and Portuguese).

It replaces the current WordPress site at launch; that site keeps its own repository.

Planning lives in [`docs/scope/scope.md`](docs/scope/scope.md).

## Run it locally

You need Node 24 (the exact version is in `.node-version`) and pnpm 12 (pinned in `package.json`).

```sh
pnpm install
pnpm dev            # local dev server
pnpm build          # static files in dist/
pnpm preview        # serves the existing dist/ exactly as Cloudflare Pages will receive it
pnpm check          # astro check (types in .astro and .ts files)
pnpm lint           # Biome lint and format check
pnpm check:islands  # proves pages without a React island never load React
```

Deploys never run on push or merge. They run only when you start the `deploy` workflow by hand in GitHub Actions (see [spec 0002](docs/specs/0002-static-site-stack.md)).
