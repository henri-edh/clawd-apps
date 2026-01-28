# 🌐 SEO Micro-Site Builder

Auto-generates niche micro-sites targeting long-tail golf tech keywords to boost FlightScope SEO.

## Purpose
Create focused, SEO-optimized landing pages that rank for specific golf technology queries, driving traffic to FlightScope products.

## Features
- Keyword research & topic generation
- Auto-generate micro-sites with HTML/CSS/JS
- SEO optimization (meta tags, structured data)
- Responsive, modern design
- Comparison pages (FlightScope vs Competitors)
- Product-specific landing pages
- Mobile-first design

## Target Keywords

### Product Comparison
- "best golf launch monitor under $2000"
- "FlightScope vs TrackMan for home use"
- "Mevo+ vs Rapsodo MLM2Pro comparison"
- "affordable golf simulator for garage"

### Use Case Pages
- "golf launch monitor for instructors"
- "home golf simulator budget"
- "outdoor golf radar portable"
- "golf swing analyzer professional"

### Feature-Focused
- "3D Doppler radar golf technology"
- "mevo+ video sync features"
- "portable golf launch monitor reviews"

## Tech Stack
- Node.js for generation
- Handlebars for templates
- SEO optimization libraries
- Modern CSS (Tailwind-like utility classes)

## Usage

```bash
# Generate a micro-site
node generate.mjs --type "comparison" --product "Mevo+" --competitor "Rapsodo"

# Generate product landing page
node generate.mjs --type "product" --product "i4" --keywords "golf launch monitor pro"

# Generate use case page
node generate.mjs --type "usecase" --usecase "home-simulator"
```

## Output Structure

```
output/
├── flightscope-vs-trackman.com/
│   ├── index.html
│   ├── css/
│   └── js/
├── best-launch-monitor-2026.com/
│   └── ...
└── mevo-plus-home-simulator.com/
    └── ...
```

## Deployment

Sites can be:
1. Hosted on Netlify/Vercel (free)
2. Deployed to subdomains of flightscope.com
3. Used for landing page experiments

## Status
🚧 **In Development**

---

*Built by Badger 🦡*
