#!/usr/bin/env node
/**
 * FlightScope Content Engine
 * Auto-generates SEO-optimized blog posts
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

// FlightScope product data (reused from SEO builder)
const PRODUCTS = {
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
    features: ["Professional grade", "4D tracking", "Full club data"],
    url: "https://flightscope.com/products/i4"
  }
};

const COMPETITORS = {
  trackman: {
    name: "TrackMan",
    weaknesses: ["Very expensive", "Requires certified installers", "Limited outdoor options"],
    startingPrice: "$15,999"
  },
  foresight: {
    name: "Foresight Sports",
    weaknesses: ["High price point", "Camera-based (not radar)", "Limited outdoor tracking"],
    startingPrice: "$7,499"
  },
  rapsodo: {
    name: "Rapsodo",
    weaknesses: ["Limited club data", "Camera-based indoors", "Less accurate at range"],
    startingPrice: "$2,999"
  }
};

// Blog post templates
const COMPARISON_TEMPLATE = `---
title: "{title}"
description: "{description}"
date: {date}
tags: [{tags}]
category: Comparison
---

# {title}

{introduction}

## {productFullName}: A Quick Overview

{productOverview}

### Key Features

{featuresList}

## {competitorName}: What You Need to Know

{competitorOverview}

## Head-to-Head Comparison

| Feature | {productFullName} | {competitorName} |
|---------|------------------|-----------------|
| Technology | 3D Doppler Radar | {competitorTech} |
| Price | {price} | {competitorPrice} |
| Portability | ✓ Portable | {portability} |
| Outdoor Use | ✓ Optimized | {outdoorUse} |
| Club Data | ✓ Full tracking | {clubData} |

## Why {productName} Wins

{advantagesList}

## {competitorName}'s Weaknesses

{weaknessesList}

## The Verdict

If you're looking for {verdictSummary}

### Who Should Choose {productName}?

- **Budget-conscious golfers** who want professional-grade data
- **Instructors** needing a portable solution for lessons
- **Home simulator builders** wanting radar accuracy
- **Serious golfers** committed to improving their game

### Bottom Line

{bottomLine}

## Learn More

[Explore {productName} Full Features]({productUrl})

---

*Tags: {tags}*
`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateComparisonPost(product, competitor) {
  const productData = PRODUCTS[product];
  const competitorData = COMPETITORS[competitor];

  if (!productData || !competitorData) {
    throw new Error('Unknown product or competitor');
  }

  const title = `${productData.fullName} vs ${competitorData.name} (2026): Which Launch Monitor Should You Buy?`;
  const date = new Date().toISOString().split('T')[0];

  const content = COMPARISON_TEMPLATE
    .replace(/{title}/g, title)
    .replace(/{description}/g, `Comprehensive 2026 comparison: ${productData.fullName} vs ${competitorData.name}. Discover why FlightScope offers better value, accuracy, and portability.`)
    .replace(/{date}/g, date)
    .replace(/{tags}/g, `${productData.name.toLowerCase()}, ${competitorData.name.toLowerCase()}, golf launch monitor, comparison`)
    .replace(/{introduction}/g, `Choosing the right golf launch monitor is a big decision. With options ranging from entry-level units like the ${productData.name} to professional systems like ${competitorData.name}, understanding the differences can save you thousands of dollars.\n\nIn this comprehensive comparison, we'll break down why the ${productData.fullName} is the smart choice for most golfers in 2026.`)
    .replace(/{productFullName}/g, productData.fullName)
    .replace(/{productName}/g, productData.name)
    .replace(/{productOverview}/g, `The ${productData.fullName} is a compact yet powerful launch monitor that brings professional-grade data to golfers at home and on the range. Priced at ${productData.price}, it offers exceptional value without sacrificing accuracy.`)
    .replace(/{featuresList}/g, productData.features.map(f => `- **${f}**: Professional-quality performance`).join('\n'))
    .replace(/{competitorName}/g, competitorData.name)
    .replace(/{competitorOverview}/g, `${competitorData.name} has established itself as a premium option in the launch monitor market. However, with a starting price of ${competitorData.startingPrice}, it's often out of reach for many golfers.`)
    .replace(/{competitorTech}/g, competitor === 'trackman' ? 'Doppler Radar' : 'Camera-based')
    .replace(/{price}/g, productData.price)
    .replace(/{competitorPrice}/g, competitorData.startingPrice)
    .replace(/{portability}/g, competitor === 'trackman' ? '✗ Fixed installation' : '✓ Portable')
    .replace(/{outdoorUse}/g, competitor === 'foresight' ? '✗ Limited' : '✓ Supported')
    .replace(/{clubData}/g, competitor === 'rapsodo' ? 'Limited' : '✓ Full tracking')
    .replace(/{advantagesList}/g, `
1. **Value**: At ${productData.price}, you're getting the same core technology as systems costing 8x more.
2. **Portability**: Take it anywhere—from your living room to the driving range.
3. **Technology**: 3D Doppler radar is proven for outdoor accuracy.
4. **Ease of Use**: Setup takes minutes, not hours.
5. **Pro Features**: Video sync, shot data, and full club tracking included.
    `.trim())
    .replace(/{weaknessesList}/g, competitorData.weaknesses.map(w => `- ${w}`).join('\n'))
    .replace(/{verdictSummary}/g, `professional accuracy without the professional price tag, the ${productData.fullName} is the clear winner.`)
    .replace(/{bottomLine}/g, `The ${productData.fullName} delivers everything 95% of golfers need. Unless you're running a commercial teaching facility with budget for a ${competitorData.name} installation, the ${productData.name} is the smarter choice. You get the same data, the same accuracy, and better portability at a fraction of the cost.`)
    .replace(/{productUrl}/g, productData.url);

  const filename = `${product}-vs-${competitor}-${date}.md`;
  return { content, filename };
}

function savePost(content, filename) {
  ensureDir(OUTPUT_DIR);
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`✅ Generated blog post: ${filename}`);
}

// CLI
const getArg = (flag) => {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

const type = getArg('--type');

if (type === 'comparison') {
  const product = getArg('--product');
  const competitor = getArg('--competitor');

  if (!product || !competitor) {
    console.error('Usage: node blog.mjs --type comparison --product mevo_plus --competitor trackman');
    process.exit(1);
  }

  try {
    const { content, filename } = generateComparisonPost(product, competitor);
    savePost(content, filename);
    console.log(`📝 Saved to: output/${filename}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
} else {
  console.log('📝 FlightScope Content Engine');
  console.log('\nUsage:');
  console.log('  node blog.mjs --type comparison --product mevo_plus --competitor trackman');
  console.log('\nAvailable products:', Object.keys(PRODUCTS).join(', '));
  console.log('Available competitors:', Object.keys(COMPETITORS).join(', '));
}
