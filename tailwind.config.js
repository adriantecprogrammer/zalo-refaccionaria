/** @type {import('tailwindcss').Config} */
import flowbitePlugin from 'flowbite/plugin';


export default {
  content: ['./index.html', './src/**/*.{html,js,vue,ts}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      height: {
        'screen': 'calc(100vh - 56px)',
        'full-screen': 'calc(100vh)',
      },
      colors: {
        primary: {
          200: '#FAF9F7',
          300: '#F2F0EB',
          500: '#E4E0D6',
          600: '#DCD7CA',
          700: '#D2CABA',
          900: '#948971',
          1000: '#877D67',
        },
        secondary: {
          200: '#F9F9FB',
          300: '#EFF0F3',
          600: '#D8D9E0',
          900: '#8B8D98'
        },
      },
    },
  },
  plugins: [flowbitePlugin],
}

