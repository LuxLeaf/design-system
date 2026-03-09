import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    {
			name: '@storybook/addon-mcp',
			options: {
				toolsets: {
					dev: true, // Tools for story URL retrieval and UI building instructions (default: true)
					docs: true, // Tools for component manifest and documentation (default: true)
				},
			},
		},
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
