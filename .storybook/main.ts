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
      url: "https://main--681d127b978cabf4002ad3a7-mhmzjiflce.staging-chromatic.com/",
    },
    '@generali/generali-ui': { disable: true },
  }
};
export default config;
