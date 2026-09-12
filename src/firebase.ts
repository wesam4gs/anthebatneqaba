import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAditqRe4VNS2rgECV7jyKxoLuARZAE9pk",
  projectId: "iraqi-nursing-syndicate",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
