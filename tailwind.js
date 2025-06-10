/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./index.html",
    "./*.html",
    "./js/**/*.js",
    "./scss/**/*.scss"
  ],
  theme: {
    extend: {
      colors: {
        // Site's custom color palette
        'black-licorice': '#1a090d',
        'black-space-cadet': '#1a1c37',
        'green-light': '#ace894',
        'green-cream': '#ebf8b8',
        'green-celadon': '#bbdfc6',
        'red-coquelicot': '#f15025',
        'tangerine': '#f08700',
        'orange': '#f08700',
        'sunset': '#ffd399',
        'yellow-naples': '#f1db4b',
        'blue-cerulean': '#006989',
        'blue-columbia': '#d4e8f2',
        'grey': '#dddedb',
        'grey-slate': '#778295',
        'white': '#ffffff',
        'black': '#000000',
        'purple-mardi-gras': '#822e81',
        
        // And the theme colors (semantic names)
        primary: '#1a1c37',      // black-space-cadet
        secondary: '#1a090d',    // black-licorice
        accent: '#f15025',       // red-coquelicot
        info: '#006989',         // blue-cerulean
        success: '#ace894',      // green-light
        warning: '#f08700',      // tangerine
        danger: '#f15025',       // red-coquelicot
        light: '#dddedb',        // grey
        dark: '#000000'          // black
      },
      fontFamily: {
        'dm-sans': ['"DM Sans"', 'monospace'],
        'raleway': ['Raleway', 'sans-serif'],
        'times': ['Times New Roman', 'serif'],
        'courier': ['Courier New', 'monospace']
      },
      fontSize: {
        'base': '1.25rem',  // Custom base font size
      },
      lineHeight: {
        'base': '1.5',      // Custom line height
      },
      maxWidth: {
        'content': '1200px', // My site's content max-width
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          'sm': '540px',
          'md': '720px',
          'lg': '960px',
          'xl': '1140px',
          '2xl': '1200px',  // Using the custom max-width
        }
      },
      spacing: {
        '0.6em': '0.6em',   // For the .content-aligned padding
        '4em': '4em',       
      },
      zIndex: {
        '1000': '1000',     // For the site's navbar
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [
    // Tailwind plugins I want later go here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}