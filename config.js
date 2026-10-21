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
