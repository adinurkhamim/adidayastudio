/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
  colors: {
    "adidaya-bg": "var(--adidaya-bg)",
    "adidaya-bg-alt": "var(--adidaya-bg-alt)",
    "adidaya-surface": "var(--adidaya-surface)",

    "adidaya-text": "var(--adidaya-text)",
    "adidaya-text-muted": "var(--adidaya-text-muted)",

    "adidaya-border": "var(--adidaya-border)",
    "adidaya-border-strong": "var(--adidaya-border-strong)",

    "adidaya-red": "var(--adidaya-red)",
    "adidaya-red-soft": "var(--adidaya-red-soft)"
  },

  borderRadius: {
    card: "var(--adidaya-radius-card)",
    pill: "var(--adidaya-radius-pill)",
  },

  boxShadow: {
    "adidaya-soft": "var(--adidaya-shadow-soft)",
    "adidaya-glow": "var(--adidaya-shadow-glow)",
  },

  fontSize: {
  "display-1": ["48px", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
  "h1": ["32px", { lineHeight: "1.10", letterSpacing: "-0.02em" }],
  "h2": ["24px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
  "h3": ["18px", { lineHeight: "1.25" }],

  "body": ["15px", { lineHeight: "1.6" }],
  "body-sm": ["13px", { lineHeight: "1.5" }],
  "label": ["11px", { letterSpacing: "0.22em" }],
}

}

  },
  plugins: [],
};
