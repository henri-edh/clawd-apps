#!/usr/bin/env node
/**
 * SEO Micro-Site Generator
 * Auto-generates SEO-optimized landing pages
 */

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const OUTPUT_DIR = path.join(process.cwd(), 'output');

// FlightScope product data
const FLIGHTSCOPE_PRODUCTS = {
  mevo_plus: {
    name: "Mevo+",
    fullName: "FlightScope Mevo+",
    price: "$1,999",
    features: ["3D Doppler radar", "Video sync", "Shot data", "Portable"],
    url: "https://flightscope.com/products/mevo-plus"
  },
  mevo_gen2: {
    name: "Mevo Gen2",
    fullName: "FlightScope Mevo Gen2",
    price: "$999",
    features: ["Portable", "iOS/Android app", "Shot tracking", "Affordable"],
    url: "https://flightscope.com/products/mevo"
  },
  i4: {
    name: "i4",
    fullName: "FlightScope i4",
    price: "$3,999",
    features: ["Professional grade", "4D tracking", "Full club data", "Ball & club tracking"],
    url: "https://flightscope.com/products/i4"
  },
  x3: {
    name: "X3",
    fullName: "FlightScope X3",
    price: "$29,999",
    features: ["Quad Doppler", "Indoor/outdoor", "Full suite", "Simulator ready"],
    url: "https://flightscope.com/products/x3"
  }
};

// Competitor data
const COMPETITORS = {
  trackman: {
    name: "TrackMan",
    products: ["TrackMan 4", "TrackMan iO", "TrackMan 3E"],
    weaknesses: ["Very expensive", "Requires certified installers", "Limited outdoor options"]
  },
  foresight: {
    name: "Foresight Sports",
    products: ["GCQuad", "GC3", "GCHawk"],
    weaknesses: ["High price point", "Camera-based (not radar)", "Limited outdoor tracking"]
  },
  rapsodo: {
    name: "Rapsodo",
    products: ["MLM2Pro", "Mobile Launch Monitor"],
    weaknesses: ["Limited club data", "Camera-based indoors", "Less accurate at range"]
  },
  skytrak: {
    name: "SkyTrak",
    products: ["SkyTrak+"],
    weaknesses: ["Camera-based only", "No club tracking", "Limited outdoor use"]
  },
  uneekor: {
    name: "Uneekor",
    products: ["EYE XO", "QED"],
    weaknesses: ["Complex setup", "High maintenance", "Limited outdoor options"]
  }
};

// SEO keywords
const KEYWORD_TEMPLATES = {
  comparison: [
    "{product} vs {competitor}",
    "best {category} launch monitor",
    "{product} review {year}",
    "{product} vs {competitor} comparison",
    "affordable {category} radar"
  ],
  usecase: [
    "best golf launch monitor for {usecase}",
    "{product} for {usecase} review",
    "how to build {usecase} with {product}",
    "top rated {usecase} monitor"
  ],
  feature: [
    "3D Doppler radar golf technology",
    "portable golf swing analyzer",
    "video sync golf launch monitor",
    "outdoor golf radar comparison"
  ]
};

// Generate HTML template
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <meta name="keywords" content="{{keywords}}">
  <link rel="canonical" href="{{canonicalUrl}}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f7fa;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .subtitle { font-size: 1.2rem; opacity: 0.9; }
    .content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-top: -30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .comparison-table th,
    .comparison-table td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .comparison-table th {
      background: #f9fafb;
      font-weight: 600;
    }
    .highlight { background: #ecfdf5; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .feature-card {
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .feature-card h3 { color: #667eea; margin-bottom: 10px; }
    .cta {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      h1 { font-size: 1.8rem; }
      .content { padding: 20px; }
      .comparison-table { font-size: 0.9rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1>{{title}}</h1>
    <p class="subtitle">{{subtitle}}</p>
  </header>
  <div class="container">
    <div class="content">
      {{{content}}}

      {{#if ctaUrl}}
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{ctaUrl}}" class="cta">Learn More About FlightScope</a>
      </div>
      {{/if}}
    </div>
  </div>
</body>
</html>`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateComparisonPage(product, competitor) {
  const productData = FLIGHTSCOPE_PRODUCTS[product];
  const competitorData = COMPETITORS[competitor];

  if (!productData || !competitorData) {
    throw new Error(`Unknown product or competitor`);
  }

  const title = `${productData.fullName} vs ${competitorData.name} - 2026 Comparison`;
  const slug = slugify(title);

  const content = `
    <h2>Why FlightScope ${productData.name} Beats ${competitorData.name}</h2>

    <p>Looking for the best golf launch monitor? Here's how ${productData.fullName} stacks up against ${competitorData.name}.</p>

    <table class="comparison-table">
      <tr>
        <th>Feature</th>
        <th class="highlight">FlightScope ${productData.name}</th>
        <th>${competitorData.name}</th>
      </tr>
      <tr>
        <td>Technology</td>
        <td class="highlight">3D Doppler Radar</td>
        <td>${competitor.name === 'TrackMan' ? 'Doppler Radar' : 'Camera-based'}</td>
      </tr>
      <tr>
        <td>Price</td>
        <td class="highlight">${productData.price}</td>
        <td>Starting from $2,999</td>
      </tr>
      <tr>
        <td>Portability</td>
        <td class="highlight">✓ Portable</td>
        <td>${competitorData.name === 'TrackMan' ? '✗ Fixed installation' : '✓ Portable'}</td>
      </tr>
      <tr>
        <td>Outdoor Use</td>
        <td class="highlight">✓ Optimized</td>
        <td>${competitorData.name === 'Foresight Sports' ? '✗ Limited' : '✓ Supported'}</td>
      </tr>
    </table>

    <h2>Key Advantages of FlightScope ${productData.name}</h2>

    <div class="features">
      ${productData.features.map(f => `
        <div class="feature-card">
          <h3>✓ ${f}</h3>
          <p>Professional-grade accuracy in a compact package.</p>
        </div>
      `).join('')}
    </div>

    <h2>${competitorData.name} Limitations</h2>

    <ul>
      ${competitorData.weaknesses.map(w => `<li><strong>${w}</strong> - This is where FlightScope has the advantage</li>`).join('')}
    </ul>

    <h2>Why Choose FlightScope?</h2>

    <p>FlightScope has been pioneering radar technology for golf since 1989. Our ${productData.name} delivers professional-grade accuracy at a fraction of the cost of traditional systems. Whether you're a professional instructor or an avid golfer looking to improve your game, FlightScope has you covered.</p>
  `;

  return {
    title,
    subtitle: `Comprehensive 2026 comparison of ${productData.name} and ${competitorData.name}`,
    description: `Compare ${productData.fullName} with ${competitorData.name}. Discover why FlightScope offers better value, portability, and accuracy for golfers of all levels.`,
    keywords: `${productData.name}, ${competitorData.name}, golf launch monitor, golf radar, comparison review`,
    content,
    ctaUrl: productData.url,
    canonicalUrl: `https://flightscope.com/compare/${slug}`
  };
}

function generateSite(data) {
  const template = Handlebars.compile(HTML_TEMPLATE);
  const html = template(data);
  return html;
}

function saveSite(data, filename) {
  ensureDir(OUTPUT_DIR);
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, htmlify(data), 'utf-8');
  console.log(`✅ Generated: ${filename}`);
}

function htmlify(data) {
  const template = Handlebars.compile(HTML_TEMPLATE);
  return template(data);
}

// CLI
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const type = getArg('--type');

if (type === 'comparison') {
  const product = getArg('--product');
  const competitor = getArg('--competitor');

  if (!product || !competitor) {
    console.error('Usage: node generate.mjs --type comparison --product mevo_plus --competitor trackman');
    process.exit(1);
  }

  try {
    const data = generateComparisonPage(product, competitor);
    const filename = `${slugify(data.title)}.html`;
    saveSite(data, filename);
    console.log(`📄 Saved to: output/${filename}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
} else {
  console.log('🌐 SEO Micro-Site Generator');
  console.log('\nUsage:');
  console.log('  node generate.mjs --type comparison --product mevo_plus --competitor trackman');
  console.log('\nAvailable products:', Object.keys(FLIGHTSCOPE_PRODUCTS).join(', '));
  console.log('Available competitors:', Object.keys(COMPETITORS).join(', '));
}
