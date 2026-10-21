/* ====== CONFIGURATION FIREBASE ======
   Collez ici les valeurs de votre projet Firebase (voir GUIDE.md, étape 2.6).
   Tant que apiKey est vide, l'application fonctionne en mode local (données sur cet appareil). */
window.PH_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};

/* ====== LOGO ET PHOTO DE CONNEXION ======
   Mettez vos images dans le dossier « img » avec exactement ces noms.
   Si une image est absente, l'application garde le logo et le décor d'origine.
   Pour utiliser un autre nom ou format (.jpg, .png, .svg, .webp), changez simplement le nom ci-dessous. */
window.PH_BRAND = {
  logo: "img/logo.png",        // logo carré, idéalement 256 × 256 pixels, fond transparent ou blanc
  loginPhoto: "img/login.jpg"  // photo de la page de connexion, format paysage, environ 1600 × 1000 pixels
};

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAIpf9diiTqu4-uFEdhYG8muWJBMPfHhZE",
    authDomain: "panorama-hotel-bb765.firebaseapp.com",
    projectId: "panorama-hotel-bb765",
    storageBucket: "panorama-hotel-bb765.firebasestorage.app",
    messagingSenderId: "1077515672779",
    appId: "1:1077515672779:web:a357820799c376baf98f4e",
    measurementId: "G-S0NG2T598K"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
