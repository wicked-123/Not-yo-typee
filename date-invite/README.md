# Date Invitation — Setup & Customization

## Quick Start

1. Open `index.html` in any browser, or serve locally:
   ```bash
   npx -y serve .
   ```
2. Open `http://localhost:3000` on your phone (or use Chrome DevTools mobile mode).

## Customization

Edit `js/config.js` to change all personal details:

```js
const dateConfig = {
  yourName:   "Alex",
  herName:    "Sophie",
  date:       "Saturday, October 18",
  time:       "7:30 PM",
  location:   "That cozy Italian place",
  dressCode:  "Whatever makes you smile",
  letterDate: "Oct 14, 2026",
  letterGreeting: "My Dearest,",
  letterBody: "Your personal message here...",
  letterSignoff: "Forever and always,",
  letterSignoffBold: "your favorite",
};
```

All text throughout the site updates automatically from this config.

## Structure

```
date-invite/
├── index.html          ← main page (10 scroll sections)
├── css/
│   └── style.css       ← all styles + animations
├── js/
│   ├── config.js       ← editable configuration
│   └── main.js         ← scroll animations, interactions, confetti
└── README.md           ← this file
```

## Deployment

Upload the entire `date-invite/` folder to any static host:
- **GitHub Pages** — push to a repo, enable Pages
- **Netlify** — drag & drop the folder
- **Vercel** — `npx vercel`

No build step required.
