// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add path resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '~': path.resolve(__dirname, './'),
};

config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, './'),
];

module.exports = withNativeWind(config, { input: './global.css' });