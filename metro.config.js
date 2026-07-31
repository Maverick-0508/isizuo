const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const relPath = moduleName.slice(2);
    const absPath = path.resolve(__dirname, relPath);

    if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      return { filePath: absPath, type: 'sourceFile' };
    }

    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const candidates = platform
      ? extensions.map((e) => `.${platform}${e}`).concat(extensions)
      : extensions;

    for (const ext of candidates) {
      if (fs.existsSync(absPath + ext)) {
        return { filePath: absPath + ext, type: 'sourceFile' };
      }
    }

    for (const ext of candidates) {
      const indexPath = path.join(absPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return { filePath: indexPath, type: 'sourceFile' };
      }
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
