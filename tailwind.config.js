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
        s3: '#ec7211',
        s3hover: '#eb5f07'
      },
      fontFamily: {
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        '3xl': '0 10px 35px -15px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
