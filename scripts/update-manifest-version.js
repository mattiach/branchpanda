import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);

const version = packageJson.version;
if (!version) {
  console.error('package.json: missing "version" field.');
  process.exit(1);
}

const manifests = [
  'manifest/manifest.chrome.json',
  'manifest/manifest.firefox.json',
];

for (const rel of manifests) {
  const filePath = path.join(root, rel);
  const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = manifest.version;

  manifest.version = version;
  fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (previous === version) {
    console.log(`${rel}: already at ${version}`);
  } else {
    console.log(`${rel}: ${previous ?? '(none)'} → ${version}`);
  }
}
