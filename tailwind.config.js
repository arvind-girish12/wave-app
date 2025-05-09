/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wave-green': '#e4f2d4',
        'wave-forest': '#275f49',
        'wave-lavender': '#dbd9fe',
        'wave-offwhite': '#f3f2ed',
        'wave-teal': '#48b7ca',
  
        // Marker colors
        'wave-marker-1': '#bdf7d4',
        'wave-marker-2': '#eeacd4',
        'wave-marker-3': '#ffde5b',
      },
    },
  },
  plugins: [],
}
  