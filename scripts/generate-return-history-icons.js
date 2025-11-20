/**
 * GENERATE RETURN HISTORY ICONS
 *
 * This Node.js script generates all required icons for the Customer Return History screen.
 * It converts SVG definitions to PNG files at the correct sizes.
 *
 * Prerequisites:
 * npm install sharp
 *
 * Usage:
 * node scripts/generate-return-history-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'customer-return-history');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

// SVG definitions
const svgIcons = {
  // Navigation Icons
  'chevron-left.png': {
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 24
  },

  'return-icon.png': {
    svg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16H24M8 16L12 12M8 16L12 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 6C16 6 22 6 22 6C22 6 22 6 22 6V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 22V26C22 26 22 26 16 26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 32
  },

  // Status Badge Icons
  'status-pending.png': {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="#FFA500" stroke-width="1.5" fill="none"/>
      <path d="M8 4V8L10.5 10.5" stroke="#FFA500" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 16
  },

  'status-processed.png': {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="#3BB77E"/>
      <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 16
  },

  'status-rejected.png': {
    svg: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="#E92B45"/>
      <path d="M10 6L6 10M6 6L10 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    size: 16
  },

  // Empty State Illustration
  'empty-state-returns.png': {
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Clipboard background -->
      <rect x="50" y="30" width="100" height="140" rx="8" fill="#F6F6F6" stroke="#E0E0E0" stroke-width="2"/>
      <!-- Clipboard clip -->
      <rect x="70" y="20" width="60" height="20" rx="4" fill="#E0E0E0"/>
      <!-- Empty lines -->
      <line x1="70" y1="60" x2="130" y2="60" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>
      <line x1="70" y1="80" x2="110" y2="80" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>
      <line x1="70" y1="100" x2="120" y2="100" stroke="#D0D0D0" stroke-width="2" stroke-linecap="round"/>
      <!-- Empty box with dashed border -->
      <rect x="80" y="115" width="40" height="40" rx="4" fill="none" stroke="#3BB77E" stroke-width="2" stroke-dasharray="4 4"/>
      <!-- Plus sign in box -->
      <path d="M100 130V145" stroke="#3BB77E" stroke-width="2" stroke-linecap="round"/>
      <path d="M92.5 137.5L107.5 137.5" stroke="#3BB77E" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    size: 200
  }
};

// Generate PNG files
let successCount = 0;
let errorCount = 0;

console.log('\n🎨 Generating Return History Icons...\n');

Object.entries(svgIcons).forEach(([filename, { svg, size }]) => {
  const outputPath = path.join(OUTPUT_DIR, filename);

  // Convert SVG to PNG using sharp
  sharp(Buffer.from(svg))
    .png()
    .resize(size * 2, size * 2) // Generate at 2x resolution for Retina displays
    .toFile(outputPath)
    .then(() => {
      console.log(`✓ Created: ${filename} (${size * 2}x${size * 2}px @2x)`);
      successCount++;

      // Check if all files are done
      if (successCount + errorCount === Object.keys(svgIcons).length) {
        printSummary();
      }
    })
    .catch(err => {
      console.error(`✗ Error creating ${filename}:`, err.message);
      errorCount++;

      // Check if all files are done
      if (successCount + errorCount === Object.keys(svgIcons).length) {
        printSummary();
      }
    });
});

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Success: ${successCount} icons`);
  console.log(`✗ Errors: ${errorCount} icons`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));

  if (successCount === Object.keys(svgIcons).length) {
    console.log('\n✅ All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Check generated icons in: src/assets/images/customer-return-history/');
    console.log('2. Run the app: npm start');
    console.log('3. Navigate to Profile > Return History');
    console.log('4. Verify all icons display correctly\n');
  } else {
    console.log('\n⚠️  Some icons failed to generate. Check errors above.\n');
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n\n❌ Generation interrupted by user');
  process.exit(1);
});
