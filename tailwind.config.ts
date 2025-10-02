import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-start-rgb))",
        foreground: "rgb(var(--text-primary))",
        card: {
          DEFAULT: "rgb(var(--card-bg))",
          foreground: "rgb(var(--text-primary))",
        },
        popover: {
          DEFAULT: "rgb(var(--card-bg))",
          foreground: "rgb(var(--text-primary))",
        },
        primary: {
          DEFAULT: "rgb(var(--text-primary))",
          foreground: "rgb(var(--background-start-rgb))",
        },
        secondary: {
          DEFAULT: "rgb(var(--text-secondary))",
          foreground: "rgb(var(--text-primary))",
        },
        muted: {
          DEFAULT: "rgb(var(--text-secondary))",
          foreground: "rgb(var(--text-secondary))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-blue))",
          foreground: "rgb(var(--text-primary))",
        },
        destructive: {
          DEFAULT: "rgb(var(--price-negative))",
          foreground: "rgb(var(--text-primary))",
        },
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.1)",
        ring: "rgb(var(--accent-blue))",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
