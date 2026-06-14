import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mandal: {
          saffron: "#FF6B00",
          "saffron-light": "#FF8C33",
          "saffron-dark": "#CC5500",
          maroon: "#7B1E1E",
          "maroon-dark": "#5C1515",
          gold: "#D4AF37",
          "gold-light": "#F0D060",
          cream: "#FFF8F0",
          "cream-dark": "#F5E6D3",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(123, 30, 30, 0.08)",
        "card-hover": "0 8px 30px rgba(123, 30, 30, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
