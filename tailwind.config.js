/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        'handwritten': ['Caveat', 'cursive'],
        'sans': ['Nunito', 'sans-serif'],
      },
      colors: {
        'camera-cream': '#f2ece1',
        'camera-border': '#e6ddd0',
        'camera-ring': '#e8d0c0',
        'camera-ring-border': '#dfc4b2',
        'camera-button': '#d68c85',
        'camera-button-hover': '#c77b74',
        'camera-button-active': '#b56a63',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(#ccc 1px, transparent 1px)',
        'texture': 'url("https://www.transparenttextures.com/patterns/stardust.png")',
      },
      backgroundSize: {
        'dot': '20px 20px',
      },
      animation: {
        'develop': 'develop 5s ease-out forwards',
      },
      keyframes: {
        develop: {
          '0%': { 
            filter: 'blur(10px) brightness(0.2) sepia(1)', 
            opacity: '0.8' 
          },
          '40%': { 
            filter: 'blur(5px) brightness(0.5) sepia(0.8)' 
          },
          '100%': { 
            filter: 'blur(0px) brightness(1) sepia(0.2)', 
            opacity: '1' 
          },
        },
      },
    },
  },
  plugins: [],
}
