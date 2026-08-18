import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, update, push, remove, runTransaction } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDn80K0PrskPBgHEQkk2RwFBlH0G9-oENY",
  authDomain: "lacanillafutbol-9aaef.firebaseapp.com",
  databaseURL: "https://lacanillafutbol-9aaef-default-rtdb.firebaseio.com",
  projectId: "lacanillafutbol-9aaef",
  storageBucket: "lacanillafutbol-9aaef.firebasestorage.app",
  messagingSenderId: "72138002098",
  appId: "1:72138002098:web:05cdcfce530d68d7b683ab",
  measurementId: "G-KBQ25MESBS"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export { ref, onValue, set, update, push, remove, runTransaction }
