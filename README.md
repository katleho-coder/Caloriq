# Caloriq

**Your daily nutrition dashboard.**

Caloriq is a React web application that helps you understand, track, and manage your daily calorie, protein, and weight progress. Set your goals, log what you eat, and see at a glance how close you are to your targets.

![Status](https://img.shields.io/badge/status-v1.0%20released-brightgreen)
![Framework](https://img.shields.io/badge/frontend-React%20%7C%20TypeScript%20%7C%20Vite-blue)
![Charts](https://img.shields.io/badge/charts-Chart.js-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **User Accounts & Login**: Individual user accounts with active profile switching and secure local persistence.
- **Daily Dashboard**: Target, consumed, and remaining calories at a glance.
- **Daily Summary**: Summary of today's calorie intake, protein consumption, and latest weight measurement.
- **Goals & Progress Bars**: Visual progress bars with smooth gradients for calories and protein.
- **Weekly Trends Chart**: 7-day intake overview plotting calories, protein, and weight simultaneously.
- **Weight Tracking & History Chart**: Record your weight and see starting weight, current weight, net change, and smooth curve weight journey.
- **Today's Food Logging (CRUD)**: Select items from a curated database or log custom foods with quantity and meal categorization (Breakfast, Lunch, Dinner, Snack); instant deletion with real-time recalculation.
- **Export & Reports**: One-click export to CSV data files or generated PDF progress reports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Charts & Visuals | Chart.js with react-chartjs-2 |
| PDF Generation | jsPDF |
| Styling | CSS3 (Preserving Caloriq's clean card design) |

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## License

Released under the [MIT License](LICENSE).
