/* Firebase Configuration — בונה הירדן המערבי */

const firebaseConfig = {
  apiKey: "AIzaSyAcNflQJvcOy_dORa0mbwI-n7Nyw-ajR0c",
  authDomain: "links-keeper-99871.firebaseapp.com",
  projectId: "bone-h",
  storageBucket: "bone-h.firebasestorage.app",
  messagingSenderId: "101466116383",
  appId: "1:101466116383:web:0fe404e8e493b7f772602a",
  measurementId: "G-9KHR4W8TVR"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

/* Storage — only init if SDK is loaded (not all pages load it) */
let storage = null;
try { storage = firebase.storage(); } catch (e) { /* storage not needed on this page */ }
