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
          "maroon-deep": "#3D0E0E",
          gold: "#D4AF37",
          "gold-light": "#F0D060",
          cream: "#FFF8F0",
          "cream-dark": "#F5E6D3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(123, 30, 30, 0.07)",
        "card-hover": "0 12px 40px rgba(123, 30, 30, 0.14)",
        glow: "0 0 40px rgba(255, 107, 0, 0.15)",
        sidebar: "4px 0 24px rgba(61, 14, 14, 0.12)",
      },
      backgroundImage: {
        "mandal-gradient": "linear-gradient(135deg, #7B1E1E 0%, #5C1515 50%, #3D0E0E 100%)",
        "saffron-gradient": "linear-gradient(135deg, #FF6B00 0%, #D4AF37 100%)",
        "cream-gradient": "linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 50%, #F5E6D3 100%)",
        "hero-pattern":
          "radial-gradient(circle at 20% 80%, rgba(255,107,0,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.1) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
