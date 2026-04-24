import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import { getFirestore } 
  from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDL3p-y6n-ADPh-xcEwWhHMS7n-sTRrLs",
  authDomain: "doccare-112af.firebaseapp.com",
  projectId: "doccare-112af",
  storageBucket: "doccare-112af.appspot.com",
  messagingSenderId: "779353681334",
  appId: "1:779353681334:web:479c1d080e18a870685f97",
  measurementId: "G-FYNP4QRB7G"
};

// Initialize only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export Firestore DB
export const db = getFirestore(app);