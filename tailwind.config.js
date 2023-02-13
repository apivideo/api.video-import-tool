/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  content: [
    './src/providers/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dropbox: '#0061FF',
        vimeo: '#32B8E8',
        gcs: '#356DF7',
      },
      fontFamily: {
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
