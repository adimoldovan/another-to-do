import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
  packagerConfig: {
    name: 'ya2d',
    productName: 'ya2d',
    executableName: 'ya2d',
    icon: 'assets/mac/icon.icns',
    appBundleId: 'com.electron.ya2d',
    appVersion: packageJson.version,
    buildVersion: packageJson.version
  },
  // Custom output directory with version
  outDir: `out/${packageJson.version}`,
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ya2d'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {}
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};
