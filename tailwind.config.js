/** @type {import('tailwindcss').Config} */
module.exports = {
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
  },
};
