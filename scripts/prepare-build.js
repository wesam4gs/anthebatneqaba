import fs from 'fs';
import path from 'path';

console.log("Starting prepare-build...");

const distDir = path.resolve('dist');
const inspectorDir = path.resolve('dist-inspector');

try {
  if (fs.existsSync(distDir)) {
    console.log("dist dir exists");
    if (fs.existsSync(inspectorDir)) {
      console.log("Removing old inspectorDir");
      fs.rmSync(inspectorDir, { recursive: true, force: true });
    }
    console.log("Creating inspectorDir");
    fs.mkdirSync(inspectorDir, { recursive: true });

    console.log("Copying dist contents to dist-inspector...");
    fs.cp(distDir, inspectorDir, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log("Copy finished.");
        const mobileHtmlPath = path.join(inspectorDir, 'mobile.html');
        const indexHtmlPath = path.join(inspectorDir, 'index.html');
        if (fs.existsSync(mobileHtmlPath)) {
          console.log("Found mobile.html, copying to index.html");
          fs.copyFileSync(mobileHtmlPath, indexHtmlPath);
          console.log('Successfully created standalone Inspector site in dist-inspector/ (root / is inspector app)');
        } else {
          console.log("mobile.html not found in dist-inspector!");
        }
    });

  } else {
    console.log("distDir not found");
  }
} catch (error) {
  console.error('Error preparing inspector build:', error);
  process.exit(1);
}
