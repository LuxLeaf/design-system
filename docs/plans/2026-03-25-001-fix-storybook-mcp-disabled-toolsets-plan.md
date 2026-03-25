---
title: "fix: Enable all disabled Storybook MCP server toolsets"
type: fix
status: active
date: 2026-03-25
---

# fix: Enable all disabled Storybook MCP server toolsets

## Overview

The Storybook MCP server (`@storybook/addon-mcp`) has three toolsets: **dev**, **docs**, and **test**. Currently only **dev** is enabled. The **docs** and **test** toolsets are disabled due to missing configuration and version requirements. All three must be enabled for the deployed version to be fully functional.

## Problem Statement

The MCP server status page shows:

| Toolset | Status | Issue |
|---------|--------|-------|
| **dev** | ENABLED | Working - provides `preview-stories` and `get-storybook-story-instructions` |
| **docs** | DISABLED | Requires enabling the component manifest feature flag |
| **test** | DISABLED | Requires Storybook 10.3.0+ with `@storybook/addon-vitest` |

## Proposed Solution

Three changes, executed in order:

1. **Upgrade Storybook** from 10.2.17 to 10.3.0+ (required for test toolset)
2. **Enable component manifest** feature flag (enables docs toolset)
3. **Install and configure addon-vitest** (enables test toolset)

## Technical Approach

### Phase 1: Upgrade Storybook to 10.3.0+

The test toolset explicitly requires Storybook 10.3.0+. This is a minor version bump with no breaking changes.

**Commands:**

```bash
pnpm exec storybook@latest upgrade
```

This upgrades all `@storybook/*` packages in lockstep. Post-upgrade, run:

```bash
pnpm exec storybook doctor
```

**Packages affected:**
- `storybook` (10.2.17 -> 10.3.x)
- `@storybook/addon-a11y` (10.2.17 -> 10.3.x)
- `@storybook/addon-docs` (10.2.17 -> 10.3.x)
- `@storybook/addon-onboarding` (10.2.17 -> 10.3.x)
- `@storybook/react-vite` (10.2.17 -> 10.3.x)
- `eslint-plugin-storybook` (10.2.17 -> 10.3.x)
- `@storybook/addon-mcp` (^0.4.2 - peer deps accept ^10.3.0-0, may also bump)

### Phase 2: Enable Component Manifest (docs toolset)

The addon-mcp checks for the feature flag at runtime (from `node_modules/@storybook/addon-mcp/dist/preset.js:772`):

```javascript
const hasFeatureFlag = !!(features?.componentsManifest ?? features?.experimentalComponentsManifest);
```

And requires BOTH the flag AND the manifest generator to be present (line 774):

```javascript
available: hasFeatureFlag && hasManifests
```

In Storybook 10.2.17, the TypeScript type only defines `experimentalComponentsManifest`. After upgrading to 10.3.0+, `componentsManifest` may be the graduated name. The addon-mcp accepts either.

**File: `.storybook/main.ts`**

Add the `features` block:

```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    {
      name: "@storybook/addon-mcp",
      options: {
        toolsets: {
          dev: true,
          docs: true,
        },
      },
    },
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  features: {
    experimentalComponentsManifest: true,
  },
};
export default config;
```

> **Note:** After upgrade, verify whether the type definition has `componentsManifest` as a non-experimental option. If so, use that instead. The addon-mcp supports both names.

### Phase 3: Install and Configure addon-vitest (test toolset)

The test toolset auto-enables when `@storybook/addon-vitest` is importable (line 432: `toolsets?.test ?? true`). No explicit `test: true` in MCP config is needed.

**Option A: Automatic setup (recommended)**

```bash
pnpm exec storybook add @storybook/addon-vitest
```

This handles installation, config generation, and Playwright browser binary installation.

**Option B: Manual setup**

Install packages:

```bash
pnpm add -D @storybook/addon-vitest vitest @vitest/browser-playwright
pnpm exec playwright install chromium
```

Create **`vitest.config.ts`** (project root):

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import viteConfig from "./vite.config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
              storybookScript: "pnpm storybook --no-open",
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              provider: playwright({}),
              headless: true,
              instances: [{ browser: "chromium" }],
            },
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  })
);
```

> **Note:** Storybook 10.3 may simplify this config and eliminate the `setupFiles` requirement. Use the automatic setup (Option A) to get the exact config for the installed version.

Create **`.storybook/vitest.setup.ts`** (if required by the installed version):

```typescript
import "@storybook/addon-vitest/setup";
```

Add to **`package.json`** scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test-storybook": "vitest --project=storybook"
  }
}
```

Update **`tsconfig.node.json`** to include the new config file:

```json
{
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

## Acceptance Criteria

- [ ] Storybook upgraded to 10.3.0+ — `pnpm storybook` starts without errors
- [ ] **docs** toolset shows ENABLED on MCP server status page
- [ ] `list-all-documentation` and `get-documentation` tools are functional
- [ ] **test** toolset shows ENABLED on MCP server status page
- [ ] `run-story-tests` tool is functional
- [ ] `pnpm test` runs story-based tests successfully
- [ ] `pnpm build-storybook` succeeds (no regression in static build)
- [ ] All three toolsets (dev, docs, test) show ENABLED simultaneously
- [ ] Existing addon-a11y integration works with test toolset (a11y violations in test results)

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Upgrade breaks existing addons (`@chromatic-com/storybook`) | CI pipeline fails | Run `storybook doctor` post-upgrade; test `build-storybook` |
| Feature flag name changes between versions | docs toolset silently stays disabled | addon-mcp accepts both `componentsManifest` and `experimentalComponentsManifest` |
| Vitest version incompatibility | Config syntax mismatch | Use `storybook add` for automatic compatible version selection |
| Playwright binaries not installed | Tests fail to run | `pnpm exec playwright install chromium` as explicit step |

## Verification Steps

After all changes, verify by:

1. Start Storybook: `pnpm storybook`
2. Navigate to the MCP server status page (shown in the screenshot)
3. Confirm all three toolsets show **ENABLED** (green badge)
4. Test each tool via the MCP client or CLI

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Upgraded Storybook deps, added vitest/playwright deps, added test scripts |
| `pnpm-lock.yaml` | Updated lockfile |
| `.storybook/main.ts` | Added `features: { experimentalComponentsManifest: true }`, normalize indentation |
| `vitest.config.ts` | **New** — Vitest config with Storybook test project |
| `.storybook/vitest.setup.ts` | **New** — Vitest setup file (if required) |
| `tsconfig.node.json` | Added `vitest.config.ts` to includes |

## Sources

- [Storybook MCP Addon](https://storybook.js.org/addons/@storybook/addon-mcp) — toolset requirements
- [Storybook Features Config](https://storybook.js.org/docs/api/main-config/main-config-features) — `experimentalComponentsManifest` flag
- [Vitest Addon Setup](https://storybook.js.org/docs/writing-tests/test-addon) — addon-vitest installation guide
- [Storybook 10.3 Release](https://storybook.js.org/releases/10.3) — upgrade notes
- Addon-mcp source: `node_modules/@storybook/addon-mcp/dist/preset.js` — feature detection logic (lines 372-432, 772-774, 1311-1334)
