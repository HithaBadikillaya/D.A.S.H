export default {
  darkMode: 'class', // Disables system preference auto-switching
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Anonymous Pro", "monospace"],
        indie: ["'Indie Flower'", "cursive"],
        amarna: ["Amarna", "serif"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        retro: {
          DEFAULT: "hsl(var(--retro-accent) / <alpha-value>)",
          red: "hsl(var(--retro-red) / <alpha-value>)",
          green: "hsl(var(--retro-green) / <alpha-value>)",
          yellow: "hsl(var(--retro-yellow) / <alpha-value>)",
          blue: "hsl(var(--retro-blue) / <alpha-value>)",
          cyan: "hsl(var(--retro-cyan) / <alpha-value>)",
          cream: "hsl(var(--retro-cream) / <alpha-value>)",
          beige: "hsl(var(--retro-beige) / <alpha-value>)",
        },
      },
    },
  },
};
