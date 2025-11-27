import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Get all dependencies from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
];

esbuild.build({
  entryPoints: ['server/_core/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  external: externalPackages,
  target: 'node22',
}).catch(() => process.exit(1));
