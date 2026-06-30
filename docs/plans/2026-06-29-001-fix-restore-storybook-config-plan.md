---
title: "fix: Restore missing .storybook configuration directory"
type: fix
status: completed
date: 2026-06-29
---

# fix: Restore missing .storybook configuration directory

Chromatic CI fails with `SB_CORE-SERVER_0006 (MainFileMissingError)` because commit `7c25a25` ("remove .storybook dir") deleted `.storybook/main.ts` and `.storybook/preview.ts`. The Chromatic GitHub Action runs `storybook build`, which requires these files.

## Root Cause

Two recent commits caused the issue:

1. **`7c25a25`** — Deleted `.storybook/main.ts` and `.storybook/preview.ts` (65 lines removed)
2. **`a374d37`** — Deleted `chromatic.config.json` which had `storybookConfigDir: "./.storybook"`, and removed the `configFile` option from the CI workflow

The CI workflow (`.github/workflows/chromatic.yml`) still triggers `storybook build` via the `chromaui/action@latest` action, which defaults to looking for config in `.storybook/`.

## Acceptance Criteria

- [ ] `.storybook/main.ts` exists with the original StorybookConfig (stories glob, addons, framework, refs)
- [ ] `.storybook/preview.ts` exists with the original Preview config (control matchers, a11y settings)
- [ ] Chromatic CI build passes — `storybook build` completes without `MainFileMissingError`
- [ ] Local `yarn storybook` and `yarn build-storybook` both work

## MVP

Restore both deleted files from commit `7c25a25`:

### .storybook/main.ts

```ts
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
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  features: {
    componentsManifest: true,
  },
  refs: {
    "chromatic-published-storybook": {
      title: "Donor",
      url: "https://tetra.chromatic.com",
    },
    "ip-url": {
      title: "IP Based",
      url: "8.8.8.8",
    },
    "local-url": {
      title: "Local based",
      url: "localhost:6006",
    },
    '@generali/generali-ui': { disable: true },
  }
};
export default config;
```

### .storybook/preview.ts

```ts
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
};

export default preview;
```

## Implementation Steps

1. Run `git checkout 7c25a25~1 -- .storybook/main.ts .storybook/preview.ts` to restore both files from the commit before deletion
2. Verify locally: `yarn build-storybook`
3. Commit and push to trigger CI

## Sources

- Deleted in commit: `7c25a25` ("remove .storybook dir")
- CI workflow: `.github/workflows/chromatic.yml`
- Storybook version: `10.3.3` (from `package.json`)
