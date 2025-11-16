// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore build directories and cache folders that cause watch errors
config.watchFolders = [path.resolve(__dirname)];
config.resolver.blacklistRE = /(\/build\/|\/\.gradle\/|\/cacheable$)/;

module.exports = config;
