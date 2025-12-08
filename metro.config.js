// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore build directories and cache folders that cause watch errors
// Fixed: Only block android/build and ios/build, not EAS /workingdir/build/
config.watchFolders = [path.resolve(__dirname)];
config.resolver.blacklistRE = /(android\/build\/|ios\/build\/|\/\.gradle\/|\/cacheable$)/;

// Configure asset handling to prevent Android AAPT compilation errors
// Set inline size to handle large images as external assets
config.transformer = {
  ...config.transformer,
  assetPlugins: [],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Increase asset inline limit to prevent bundling huge images
config.resolver.assetExts = config.resolver.assetExts || [];

module.exports = config;
