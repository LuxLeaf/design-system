---
title: "Re-enable Azure Pipelines Chromatic workflow using npx chromatic CLI"
type: feat
status: active
date: 2026-08-24
---

# Re-enable Azure Pipelines Chromatic workflow using npx chromatic CLI

## Overview

Re-create the `azure-pipelines.yml` workflow to run Chromatic visual testing via the CLI (`npx chromatic`) instead of the previously used `npx @workleap/chromado`. The workflow must target a specific Chromatic backend using the `CHROMATIC_INDEX_URL` environment variable.

## Problem Statement

The Azure Pipelines config (`azure-pipelines.yml`) was previously created on the `chromado` branch but does not exist on the current `oopsies` branch or `main`. It used `npx @workleap/chromado` and yarn. We need a fresh version that:

1. Uses `npx chromatic` directly (the standard Chromatic CLI)
2. Sets `CHROMATIC_INDEX_URL` to target `https://chromatic-www-pr-11830.herokuapp.com`
3. Uses pnpm (the project's current package manager) instead of yarn

## Context

### How `CHROMATIC_INDEX_URL` works

`CHROMATIC_INDEX_URL` is an environment variable recognized by the Chromatic CLI (source: `node_modules/chromatic/dist/node-src-CVSyADHJ.cjs`). It defaults to `https://index.chromatic.com` and controls which Chromatic API backend the CLI communicates with:

```js
// From chromatic CLI source
CHROMATIC_INDEX_URL: gs = `https://index.chromatic.com`
// Used for GraphQL endpoint:
e.client = new pr(e, `${e.env.CHROMATIC_INDEX_URL}/graphql`, ...)
```

Setting it to a different URL (like `https://chromatic-www-pr-11830.herokuapp.com`) redirects all CLI API calls to that instance.

### Reference: existing GitHub Actions workflow

The current `.github/workflows/chromatic.yml` demonstrates usage with the GitHub Action:

```yaml
env:
  CHROMATIC_INDEX_URL: https://chromatic-www-pr-10096.herokuapp.com  # old PR URL
steps:
  - uses: chromaui/action@latest
    with:
      projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

The CLI approach achieves the same by passing `CHROMATIC_INDEX_URL` as an env var to the `npx chromatic` command.

### Previous Azure Pipelines config (chromado branch)

The old `azure-pipelines.yml` used:
- Trigger on `chromado` branch
- Yarn via Corepack for dependency install
- `npx @workleap/chromado` as the CLI command
- `CHROMATIC_PROJECT_TOKEN` and `CHROMATIC_PULL_REQUEST_COMMENT_ACCESS_TOKEN` env vars

### Project configuration

| Setting | Value |
|---------|-------|
| Package manager | pnpm 9.12.3 (`packageManager` field in `package.json`) |
| Node.js | 22.x (`.tool-versions`: 22.21.1) |
| npmrc | `node-linker=hoisted` |
| Existing chromatic script | `npx chromatic --project-token=chpt_48d650420a3234a` |

## Proposed Solution

Create a new `azure-pipelines.yml` at the repo root with:

### azure-pipelines.yml

```yaml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main
  drafts: false

pool:
  vmImage: 'ubuntu-latest'

steps:
  - checkout: self
    displayName: 'Checkout with full git history'
    fetchDepth: 0
    clean: true

  - task: UseNode@1
    displayName: 'Install Node.js 22.x'
    inputs:
      version: '22.x'

  - task: Bash@3
    displayName: 'Install pnpm'
    inputs:
      targetType: 'inline'
      script: |
        corepack enable
        corepack prepare pnpm@9.12.3 --activate

  - script: pnpm install --frozen-lockfile
    displayName: 'Install dependencies'

  - script: npx chromatic
    displayName: 'Run Chromatic'
    env:
      CHROMATIC_PROJECT_TOKEN: $(CHROMATIC_PROJECT_TOKEN)
      CHROMATIC_INDEX_URL: https://chromatic-www-pr-11830.herokuapp.com
```

### Key changes from previous version

| Aspect | Old (chromado branch) | New |
|--------|----------------------|-----|
| Branch trigger | `chromado` | `main` (adjust as needed) |
| Package manager | yarn via Corepack | pnpm via Corepack |
| CLI command | `npx @workleap/chromado` | `npx chromatic` |
| `CHROMATIC_INDEX_URL` | not set | `https://chromatic-www-pr-11830.herokuapp.com` |
| `CHROMATIC_PULL_REQUEST_COMMENT_ACCESS_TOKEN` | set | omitted (add back if PR comments are needed) |

## Acceptance Criteria

- [ ] `azure-pipelines.yml` exists at repo root
- [ ] Pipeline uses `npx chromatic` (not chromado, not GitHub Action)
- [ ] `CHROMATIC_INDEX_URL` is set to `https://chromatic-www-pr-11830.herokuapp.com`
- [ ] `CHROMATIC_PROJECT_TOKEN` is passed from Azure Pipelines variable group/secret
- [ ] Dependencies are installed via `pnpm install --frozen-lockfile`
- [ ] Node.js 22.x is used
- [ ] Full git history is fetched (`fetchDepth: 0`) for accurate baselines

## Open Questions

- **Branch triggers**: The old pipeline triggered on `chromado`. Should this target `main`, `oopsies`, or another branch?
- **PR comment token**: The old pipeline passed `CHROMATIC_PULL_REQUEST_COMMENT_ACCESS_TOKEN`. Is this still needed?
- **GitHub Actions chromatic.yml**: Should its `CHROMATIC_INDEX_URL` also be updated from `pr-10096` to `pr-11830`, or are these independent workflows?

## Sources

- Existing GitHub workflow: `.github/workflows/chromatic.yml:10` — reference for `CHROMATIC_INDEX_URL` usage
- Previous Azure Pipelines: `chromado` branch, commits `c1220b0` and `095dedb`
- Chromatic CLI source: `node_modules/chromatic/dist/node-src-CVSyADHJ.cjs` — `CHROMATIC_INDEX_URL` defaults and usage
- [Chromatic CLI docs](https://www.chromatic.com/docs/cli/)
- [Chromatic configuration reference](https://www.chromatic.com/docs/configure/)
