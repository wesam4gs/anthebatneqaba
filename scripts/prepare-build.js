import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const inspectorDir = path.resolve('dist-inspector');

try {
  if (fs.existsSync(distDir)) {
    // Recreate dist-inspector
    if (fs.existsSync(inspectorDir)) {
      fs.rmSync(inspectorDir, { recursive: true, force: true });
    }
    fs.mkdirSync(inspectorDir, { recursive: true });

    // Copy dist contents to dist-inspector recursively
    fs.cpSync(distDir, inspectorDir, { recursive: true });

    // In dist-inspector, replace index.html with mobile.html
    const mobileHtmlPath = path.join(inspectorDir, 'mobile.html');
    const indexHtmlPath = path.join(inspectorDir, 'index.html');
    if (fs.existsSync(mobileHtmlPath)) {
      fs.copyFileSync(mobileHtmlPath, indexHtmlPath);
      console.log('✓ Successfully created standalone Inspector site in dist-inspector/ (root / is inspector app)');
    }
  }
} catch (error) {
  console.error('Error preparing inspector build:', error);
}
