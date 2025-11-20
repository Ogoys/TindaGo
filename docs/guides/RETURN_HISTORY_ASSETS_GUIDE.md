# Customer Return History - Asset Extraction Guide

This guide provides instructions for extracting and creating all visual assets for the Customer Return History screen.

## Required Assets Directory
All assets should be saved to: `C:\CapsProj\TindaGo\src\assets\images\customer-return-history\`

## Asset List

### 1. Navigation Icons

#### chevron-left.png (REPLACE EXISTING)
- **Size**: 24x24px (will be scaled to 15x15 in code)
- **Style**: Simple left-pointing chevron
- **Color**: #1E1E1E (darkGray)
- **Format**: PNG with transparency
- **Figma Location**: Back button in header

**SVG Source Code:**
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 18L9 12L15 6" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

#### return-icon.png (REPLACE EXISTING)
- **Size**: 32x32px (will be scaled to 25x25 in code)
- **Style**: Return/refund box icon
- **Color**: #FFFFFF (white, as it sits on brown background)
- **Format**: PNG with transparency
- **Figma Location**: Inside brown square on return cards

**SVG Source Code:**
```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 16H24M8 16L12 12M8 16L12 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 6C16 6 22 6 22 6C22 6 22 6 22 6V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 22V26C22 26 22 26 16 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### 2. Status Badge Icons (NEW)

#### status-pending.png
- **Size**: 16x16px
- **Style**: Clock/hourglass icon
- **Color**: #FFA500 (orange)
- **Format**: PNG with transparency
- **Usage**: Displayed next to "Pending" status text

**SVG Source Code:**
```svg
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="7" stroke="#FFA500" stroke-width="1.5" fill="none"/>
  <path d="M8 4V8L10.5 10.5" stroke="#FFA500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

#### status-processed.png
- **Size**: 16x16px
- **Style**: Checkmark in circle
- **Color**: #3BB77E (primary green)
- **Format**: PNG with transparency
- **Usage**: Displayed next to "Processed" status text

**SVG Source Code:**
```svg
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="7" fill="#3BB77E"/>
  <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

#### status-rejected.png
- **Size**: 16x16px
- **Style**: X mark in circle
- **Color**: #E92B45 (red)
- **Format**: PNG with transparency
- **Usage**: Displayed next to "Rejected" status text

**SVG Source Code:**
```svg
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="7" fill="#E92B45"/>
  <path d="M10 6L6 10M6 6L10 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### 3. Empty State Illustration (NEW)

#### empty-state-returns.png
- **Size**: 200x200px
- **Style**: Minimalist illustration of empty box or clipboard
- **Color**: Grayscale with subtle green accent
- **Format**: PNG with transparency
- **Usage**: Displayed when user has no return history

**SVG Source Code:**
```svg
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Clipboard -->
  <rect x="50" y="30" width="100" height="140" rx="8" fill="#F6F6F6" stroke="#E0E0E0" stroke-width="2"/>
  <rect x="70" y="20" width="60" height="20" rx="4" fill="#E0E0E0"/>

  <!-- Lines representing text (empty) -->
  <line x1="70" y1="60" x2="130" y2="60" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>
  <line x1="70" y1="80" x2="110" y2="80" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>
  <line x1="70" y1="100" x2="120" y2="100" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>

  <!-- Empty box icon in center -->
  <rect x="80" y="115" width="40" height="40" rx="4" fill="none" stroke="#3BB77E" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M100 130V145" stroke="#3BB77E" stroke-width="2" stroke-linecap="round"/>
  <path d="M92.5 137.5L107.5 137.5" stroke="#3BB77E" stroke-width="2" stroke-linecap="round"/>
</svg>
```

## How to Generate PNG Files from SVG

### Option 1: Using Online Tool (Easiest)
1. Visit https://svgtopng.com/ or https://cloudconvert.com/svg-to-png
2. Copy the SVG code above
3. Paste into a text editor and save as `.svg` file
4. Upload to converter
5. Download PNG at required size
6. Save to `src/assets/images/customer-return-history/`

### Option 2: Using Figma (Best Quality)
1. Open your Figma file: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-6206
2. Locate the Return History screen (Node 1428-6206)
3. Select each icon/image element
4. Right-click → Export → PNG (at appropriate scale)
5. Save to `src/assets/images/customer-return-history/`

### Option 3: Using Node.js Script
Save this as `generate-return-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const svgs = {
  'chevron-left.png': '<svg width="24" height="24"...',
  'return-icon.png': '<svg width="32" height="32"...',
  'status-pending.png': '<svg width="16" height="16"...',
  'status-processed.png': '<svg width="16" height="16"...',
  'status-rejected.png': '<svg width="16" height="16"...',
  'empty-state-returns.png': '<svg width="200" height="200"...'
};

const outputDir = 'C:\\CapsProj\\TindaGo\\src\\assets\\images\\customer-return-history';

Object.entries(svgs).forEach(([filename, svgContent]) => {
  sharp(Buffer.from(svgContent))
    .png()
    .toFile(`${outputDir}/${filename}`)
    .then(() => console.log(`Created ${filename}`))
    .catch(err => console.error(`Error creating ${filename}:`, err));
});
```

Run: `npm install sharp && node generate-return-icons.js`

## Figma API Setup for Direct Extraction

To use the MCP tool to directly extract assets from Figma:

1. Get Figma Personal Access Token:
   - Go to https://www.figma.com/developers/api#access-tokens
   - Click "Get personal access token"
   - Copy the token

2. Update `.claude/mcp-settings.json`:
   ```json
   {
     "mcpServers": {
       "Framelink Figma MCP": {
         "command": "cmd",
         "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR_ACTUAL_TOKEN_HERE", "--stdio"]
       }
     }
   }
   ```

3. Replace `YOUR_ACTUAL_TOKEN_HERE` with your token

4. Restart Claude Code

5. Use commands like:
   ```
   Extract all assets from Figma node 1428-6206
   ```

## Asset Integration Checklist

- [ ] Replace `chevron-left.png` with higher quality version
- [ ] Replace `return-icon.png` with higher quality version
- [ ] Add `status-pending.png`
- [ ] Add `status-processed.png`
- [ ] Add `status-rejected.png`
- [ ] Add `empty-state-returns.png`
- [ ] Update `return-history.tsx` to use new status icons
- [ ] Update `return-history.tsx` to use empty state illustration
- [ ] Test on iOS and Android devices
- [ ] Verify all assets scale correctly with responsive functions

## Asset Specifications Summary

| Asset | Size | Color | Background | Usage |
|-------|------|-------|------------|-------|
| chevron-left.png | 24x24px | #1E1E1E | Transparent | Navigation back |
| return-icon.png | 32x32px | #FFFFFF | Transparent | Card icon |
| status-pending.png | 16x16px | #FFA500 | Transparent | Status badge |
| status-processed.png | 16x16px | #3BB77E | Transparent | Status badge |
| status-rejected.png | 16x16px | #E92B45 | Transparent | Status badge |
| empty-state-returns.png | 200x200px | Mixed | Transparent | Empty state |

All assets should be exported at @2x or @3x resolution for Retina displays.
