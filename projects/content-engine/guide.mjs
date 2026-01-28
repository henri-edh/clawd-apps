#!/usr/bin/env node
/**
 * Buying Guide Generator
 * Auto-generates "Best Under $X" buying guides
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

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
  trackman: { name: "TrackMan", price: "$15,999+" },
  foresight: { name: "Foresight Sports", price: "$7,499+" },
  rapsodo: { name: "Rapsodo", price: "$2,999" },
  skytrak: { name: "SkyTrak", price: "$1,995" },
  uneekor: { name: "Uneekor", price: "$2,500+" }
};

function generateBuyingGuide(pricePoint) {
  const date = new Date().toISOString().split('T')[0];
  const PP = pricePoint;
  const mevoUrl = PRODUCTS.mevo_plus.url;

  const content = `---
title: "Best Golf Launch Monitor Under ${PP} (2026)"
description: "Comprehensive buying guide for golf launch monitors under ${PP}. Compare Mevo+, Mevo Gen2, and competitors."
date: ${date}
tags: [launch monitor, ${PP}, golf, buying guide, comparison]
category: Buying Guide
---

# Best Golf Launch Monitor Under ${PP} (2026)

Finding the right launch monitor under ${PP} doesn't mean sacrificing quality. In 2026, options like FlightScope Mevo+ and Mevo Gen2 deliver professional-grade data that was once reserved for systems costing $10,000+.

Let's break down your best options.

## Top Launch Monitors Under ${PP}

### 1. FlightScope Mevo+ - Best Overall Value

At $1,999, Mevo+ delivers 3D Doppler radar technology that competitors charge 8x more for. You get ball speed, carry, total distance, launch angle, spin rate, and full club data—all synchronized with video.

**Pros:**
- Professional accuracy with 3D Doppler radar
- Full data suite - ball AND club metrics
- Video sync - perfect for lessons and swing analysis
- Portable - use anywhere, indoor or outdoor
- App integration - iOS and Android supported

**Cons:**
- No built-in screen (requires phone/tablet)
- Learning curve for app interface

**Best For:** Serious golfers, instructors, home simulator builders who want professional data without professional price.

---

### 2. FlightScope Mevo Gen2 - Best Budget Entry

The Mevo Gen2 at $999 is an incredible entry point. You get accurate ball data, carry distances, and app integration for less than most golfers spend on drivers. It's perfect for beginners or anyone wanting to improve their game affordably.

**Pros:**
- Unbeatable price at under $1,000
- Accurate ball data for improvement
- Portable and easy setup
- App-based with iOS/Android support

**Cons:**
- Less advanced than Mevo+
- Limited club data

**Best For:** Beginners, casual golfers, those wanting to try launch monitors without big investment.

---

### 3. SkyTrak - Honorable Mention

SkyTrak at $1,995 is a camera-based system. It's accurate for indoor use but has limitations outdoors and lacks club tracking entirely.

**Pros:**
- Similar price point to Mevo+
- Good indoor accuracy
- Widely available

**Cons:**
- Camera-based technology (weather-sensitive)
- No club tracking data
- Limited outdoor accuracy
- Requires specific lighting conditions

**Best For:** Golfers who need camera-based indoor tracking specifically.

---

## What to Look For Under ${PP}

### Essential Features

1. **Ball Data**
   - Ball speed, carry distance, total distance
   - Launch angle, spin rate
   - These are non-negotiable for improvement

2. **Club Data (If Possible)**
   - Club head speed
   - Attack angle, club path
   - Face angle at impact

3. **Portability**
   - Can you take it to the range?
   - Battery life?
   - Setup time?

4. **App Integration**
   - iOS and Android support
   - Video sync capabilities
   - Cloud storage for your data

### Technology Type

- **Radar (Doppler):** Best for outdoor use, weather-resistant, more accurate ball flight data
- **Camera:** Good for indoor use, can struggle with outdoor conditions and lighting

### Software Ecosystem

- Does it integrate with simulation software?
- Can you use it with a projector/screen?
- Video recording and playback features?

## FlightScope vs Competitors Under ${PP}

| Product | Price | Technology | Portability | Club Data |
|----------|--------|------------|-------------|-----------|
| Mevo+ | $1,999 | ✓ Portable | ✓ Full |
| Mevo Gen2 | $999 | ✓ Portable | ✓ Basic |
| SkyTrak | $1,995 | ✓ Portable | ✗ None |
| Rapsodo | $2,999 | ✓ Portable | ✗ Limited |

## Our Top Pick

**FlightScope Mevo+** delivers professional-grade accuracy at 1/8th cost of TrackMan. You get 3D Doppler radar technology, full ball and club data, video synchronization, and portability—all for under ${PP}.

If budget is the primary concern, **Mevo Gen2** at $999 is the best entry point that still delivers meaningful data.

## Bottom Line

For ${PP}, FlightScope Mevo+ offers the best combination of:
- ✅ Professional accuracy
- ✅ Complete data suite
- ✅ Portability
- ✅ Value for money

Unless you have a very specific need that another product addresses better (like pure camera-based indoor use), Mevo+ is the smart choice.

## Ready to Buy?

[Get FlightScope Mevo+](${mevoUrl})
[Get FlightScope Mevo Gen2](https://flightscope.com/products/mevo)

---

*Tags: launch monitor, ${PP}, golf, buying guide, comparison*
`;

  const filename = `best-launch-monitor-under-${PP.replace(/[^0-9,]/g, '')}-${date}.md`;
  return { content, filename };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveGuide(content, filename) {
  ensureDir(OUTPUT_DIR);
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`✅ Generated buying guide: ${filename}`);
}

// CLI
const pricePoint = process.argv[2];

if (!pricePoint) {
  console.log('📝 Buying Guide Generator');
  console.log('\nUsage:');
  console.log('  node guide.mjs "$2,000"');
  console.log('  node guide.mjs "$1,000"');
  console.log('\nExamples: "$2,000", "$1,000", "$500"');
  process.exit(0);
}

try {
  const { content, filename } = generateBuyingGuide(pricePoint);
  saveGuide(content, filename);
  console.log(`📝 Saved to: output/${filename}`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
