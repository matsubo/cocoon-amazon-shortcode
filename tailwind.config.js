/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./options/**/*.{html,js,ts}",
    "./src/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    logs: false,
  },
  // Tailwind CSS v4 specific configuration
  future: {
    // Enable all upcoming breaking changes
    hoverOnlyWhenSupported: true,
  },
  // Disable core plugins that are now included in the CSS by default
  corePlugins: {
    // Add any core plugins to disable if needed
  },
};
