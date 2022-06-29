<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-codemirror&project=solid-codemirror" alt="solid-codemirror">
</p>

# solid-codemirror

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![NPM Downloads](https://img.shields.io/npm/dw/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/riccardoperra/solid-codemirror)
[![npm version](https://img.shields.io/npm/v/solid-codemirror?style=for-the-badge)](https://www.npmjs.com/package/solid-codemirror)
[![license](https://img.shields.io/npm/l/solid-codemirror?style=for-the-badge)](https://github.com/riccardoperra/solid-codemirror/blob/main/LICENSE)

your-repository-desc

> **Note** After using this template, you have to search and replace all `your-repository-name` and similar strings
> with appropriate texts.
>
> `your-repository-name` should be a **kebab-case** string representing the name of you monorepo.
>
> `your-repository-desc` should be a **Normal case** string with the description of the repository.
>
> `your-nickname` should be a **kebab-case** string from your profile URL.
>
> `your-author-name` should be a **Normal case** string with your first and last name.

## Project Commands

List of cli commands available from a project root.

To use the commands, first install [pnpm](https://pnpm.io) and install dependencies with `pnpm i`.

```bash
pnpm run dev
# Builds all packages in watch mode, and starts all playgrounds
# turbo run dev --parallel

pnpm run build
# Builds all the packages in the monorepo
# turbo run build --filter=!./playgrounds/*

pnpm run test
# Runs tests for all the packages in the monorepo
# turbo run test --filter=!./playgrounds/*

pnpm run typecheck
# Runs TS typecheck for all the packages in the monorepo
# turbo run typecheck --filter=!./playgrounds/*

pnpm run build-test
# Runs build, typecheck and test commands for all the packages in the monorepo
# "turbo run build test typecheck --filter=!./playgrounds/*

pnpm run format
# Formats the reposotory with prettier
# prettier -w \"packages/**/*.{js,ts,json,css,tsx,jsx,md}\" \"playgrounds/**/*.{js,ts,json,css,tsx,jsx,md}\"

pnpm run changeset
# Creates a changeset
# changeset

pnpm run version-packages
# Applies changesets to bump package versions and update CHANGELOGs
# "changeset version && pnpm i

pnpm run release
# Builds and publishes changed packages to npm
# pnpm run build-test && changeset publish

pnpm run update-deps
# Updates all dependencies in the repository
# taze -w -r && pnpm i
```
