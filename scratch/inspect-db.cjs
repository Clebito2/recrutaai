const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAB-WbQRe46VCE6QHU5Y_qJf07r1H7wy7E",
    authDomain: "daily-catholic-meditation.firebaseapp.com",
    projectId: "daily-catholic-meditation",
    storageBucket: "daily-catholic-meditation.firebasestorage.app",
    messagingSenderId: "447098340806",
    appId: "1:447098340806:web:8d1f59144097087007dec7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  console.log('--- Inspecting Users ---');
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log(`Found ${usersSnap.size} users`);
    usersSnap.forEach(doc => {
      const data = doc.data();
      console.log(`User ${doc.id}: email=${data.email}, companyName=${data.companyName}, companies=${JSON.stringify(data.companies || [])}`);
    });
  } catch (e) {
    console.error('Error fetching users:', e.message);
  }

  console.log('\n--- Inspecting Jobs ---');
  try {
    const jobsSnap = await getDocs(collection(db, 'jobs'));
    console.log(`Found ${jobsSnap.size} jobs`);
    jobsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`Job ${doc.id}: title=${data.title}, companyName=${data.companyName}, userId=${data.userId}`);
    });
  } catch (e) {
    console.error('Error fetching jobs:', e.message);
  }
}

inspect();
