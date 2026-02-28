import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBqQS90gihFdXfG_ONbLvrR6N1b2AnP0yk",
  authDomain: "viajecitocr.firebaseapp.com",
  databaseURL: "https://viajecitocr-default-rtdb.firebaseio.com",
  projectId: "viajecitocr",
  storageBucket: "viajecitocr.firebasestorage.app",
  messagingSenderId: "679414504729",
  appId: "1:679414504729:web:77256abf8aa16755213988",
  measurementId: "G-GDCFPECEQ4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log ("Firebase inicializado correctamente");

const productosRef = ref(db, "productos");

get(productosRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log("Datos recibidos:", snapshot.val());
    } else {
      console.log("No hay datos en productos");
    }
  })
  .catch((error) => {
    console.error("Error al leer Firebase:", error);
  });