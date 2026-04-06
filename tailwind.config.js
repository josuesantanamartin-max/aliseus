/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./store/**/*.{js,ts,jsx,tsx}",
        "./config/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce-slight': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px -3px rgba(79, 70, 229, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
            },
            colors: {
                aliseus: {
                    50: 'rgb(var(--color-aliseus-50) / <alpha-value>)',
                    100: 'rgb(var(--color-aliseus-100) / <alpha-value>)',
                    200: 'rgb(var(--color-aliseus-200) / <alpha-value>)',
                    300: 'rgb(var(--color-aliseus-300) / <alpha-value>)',
                    400: 'rgb(var(--color-aliseus-400) / <alpha-value>)',
                    500: 'rgb(var(--color-aliseus-500) / <alpha-value>)',
                    600: 'rgb(var(--color-aliseus-600) / <alpha-value>)',
                    700: 'rgb(var(--color-aliseus-700) / <alpha-value>)',
                    800: 'rgb(var(--color-aliseus-800) / <alpha-value>)',
                    900: 'rgb(var(--color-aliseus-900) / <alpha-value>)',
                    950: 'rgb(var(--color-aliseus-950) / <alpha-value>)',
                },
                indigo: {
                    primary: 'rgb(var(--color-indigo-primary) / <alpha-value>)',
                    soft: 'rgb(var(--color-indigo-soft) / <alpha-value>)',
                }
            },
            borderRadius: {
                'aliseus': '24px'
            }
        },
    },
    plugins: [],
}
