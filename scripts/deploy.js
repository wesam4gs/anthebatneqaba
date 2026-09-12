import { execSync } from 'child_process';

const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || "";
const target = process.argv[2] || 'all';

console.log(`🚀 Starting deployment for target: ${target}...`);

try {
  if (target === 'inspector') {
    console.log('Deploying Inspector to https://iraqi-inspectormopile.web.app ...');
    execSync(`firebase deploy --only hosting:iraqi-inspectormopile --project iraqi-nursing-syndicate --token "${FIREBASE_TOKEN}"`, { stdio: 'inherit' });
  } else if (target === 'platform') {
    console.log('Deploying Main Platform to https://iraqi-nursing-syndicate.web.app ...');
    execSync(`firebase deploy --only hosting:iraqi-nursing-syndicate --project iraqi-nursing-syndicate --token "${FIREBASE_TOKEN}"`, { stdio: 'inherit' });
  } else {
    console.log('Deploying Both Sites to Firebase Hosting...');
    execSync(`firebase deploy --only hosting --project iraqi-nursing-syndicate --token "${FIREBASE_TOKEN}"`, { stdio: 'inherit' });
  }
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment error:', error.message);
  process.exit(1);
}
