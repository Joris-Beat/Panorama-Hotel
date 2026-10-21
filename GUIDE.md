# Panorama Hotel Manager — guide de mise en ligne gratuite, pas à pas

Les noms exacts des boutons dans Firebase, Netlify ou Cloudflare peuvent changer légèrement avec le temps. Si un nom ne correspond pas exactement, cherchez le bouton qui s'en rapproche.

Compte final : un site accessible à tous (clients et personnel), une base de données et une connexion sécurisée, le tout gratuit et sans carte bancaire.

---

## 0. Le contenu du dossier

```
panorama-hotel/
├── index.html            Structure de la page (HTML)
├── config.js             VOS paramètres : Firebase, logo et photo
├── img/                  VOS images : logo.png et login.jpg
├── firestore.rules       Règles de sécurité (à coller dans Firebase)
├── GUIDE.md              Ce guide
├── css/
│   └── style.css         Apparence (CSS)
└── js/
    ├── core/             Le moteur de l'application
    │   ├── utils.js          Outils (dates, texte, stockage)
    │   ├── data.js           Lecture et écriture des données
    │   ├── firebase.js       Connexion Firebase, disponibilités, suivi client
    │   ├── parametres.js     Réglages de l'hôtel
    │   ├── permissions.js    Rôles et droits d'accès
    │   ├── metier.js         Calculs : séjours, soldes, chiffre d'affaires
    │   ├── ui.js             Fenêtres, formulaires, tableaux, icônes
    │   ├── listeners.js      Réaction aux clics et aux saisies
    │   └── main.js           Démarrage
    └── modules/          Un fichier par fonction de l'hôtel
        ├── crud.js               Formulaires clients, chambres, stock, etc.
        ├── reservations.js       Création, arrivée, départ, annulation
        ├── folio-facture.js      Dépenses, paiements, facture
        ├── shell.js              Écrans de connexion et menu
        ├── demo.js               Données de démonstration
        ├── dashboard.js          Tableau de bord
        ├── reservations-liste.js Liste des réservations
        ├── planning.js           Planning des chambres
        ├── chambres.js           Chambres
        ├── clients.js            Clients
        ├── facturation-caisse.js Facturation et caisse
        ├── menage.js             Ménage
        ├── maintenance.js        Maintenance
        ├── restaurant-bar.js     Restaurant et bar
        ├── evenements.js         Événements
        ├── stock-fournisseurs.js Stock et fournisseurs
        ├── rh.js                 Employés, présences, congés, paie
        ├── espace-client.js      Réservation en ligne pour les clients
        ├── rapports.js           Rapports
        ├── utilisateurs.js       Utilisateurs et rôles
        ├── parametres-page.js    Paramètres, sauvegarde, journal
        └── formulaires-auth.js   Installation et connexion
```

**Règle importante :** gardez exactement cette organisation de dossiers. Si vous déplacez un fichier, la page restera blanche. L'ordre de chargement des fichiers JavaScript est écrit dans `index.html` : ne le changez pas.

---

## 1. Préparer le dossier sur votre ordinateur

1. Téléchargez le fichier ZIP, faites un clic droit dessus, **Extraire tout**.
2. Vous obtenez un dossier `panorama-hotel`. Ouvrez-le et vérifiez que vous voyez directement `index.html`, `config.js`, `css` et `js` (et pas un deuxième dossier à l'intérieur).

---

## 2. Créer le projet Firebase

### 2.1 Le projet
1. Allez sur **https://console.firebase.google.com**.
2. Connectez-vous avec un compte Google.
3. Cliquez sur **Créer un projet** (ou **Add project**).
4. Nom du projet : `panorama-hotel` (ou le nom de votre hôtel). Cliquez sur **Continuer**.
5. Google Analytics : désactivez l'interrupteur (inutile), puis cliquez sur **Créer le projet**.
6. Attendez la fin de la création, puis **Continuer**.

### 2.2 La connexion du personnel
1. Menu de gauche : **Build** (ou **Compiler**), puis **Authentication**.
2. Cliquez sur **Commencer** (**Get started**).
3. Onglet **Sign-in method** (**Méthode de connexion**) : cliquez sur **E-mail/Mot de passe**.
4. Activez le **premier** interrupteur (« E-mail/Mot de passe »). Laissez le deuxième (lien par e-mail) désactivé.
5. Cliquez sur **Enregistrer**.

### 2.3 La base de données
1. Menu de gauche : **Build**, puis **Firestore Database**.
2. Cliquez sur **Créer une base de données**.
3. Emplacement : choisissez le plus proche de vos clients (par exemple une région en Europe). Ce choix est définitif. **Suivant**.
4. Mode : choisissez **Démarrer en mode production**. **Créer**.
5. Attendez que la base apparaisse.

### 2.4 Les règles de sécurité (obligatoire)
1. Dans Firestore Database, ouvrez l'onglet **Règles**.
2. Sélectionnez tout le texte (Ctrl+A) et supprimez-le.
3. Ouvrez le fichier **firestore.rules** avec le Bloc-notes, copiez tout son contenu (Ctrl+A puis Ctrl+C), et collez-le dans la zone des règles de Firebase.
4. Cliquez sur **Publier**. Un message de confirmation apparaît.

### 2.5 Récupérer vos valeurs de connexion
1. Cliquez sur la **roue dentée** en haut à gauche, puis **Paramètres du projet**.
2. Descendez jusqu'à **Vos applications**. Cliquez sur l'icône web **`</>`**.
3. Surnom de l'application : `panorama-hotel`. **Ne cochez pas** « Firebase Hosting ». Cliquez sur **Enregistrer l'application**.
4. Firebase affiche un bloc de code qui contient `apiKey`, `authDomain`, `projectId` et `appId` (et d'autres lignes que vous pouvez ignorer). Laissez cette page ouverte.

### 2.6 Remplir config.js
1. Sur votre ordinateur, ouvrez **config.js** avec le Bloc-notes.
2. Remplacez chaque valeur vide par celle de Firebase, en gardant les guillemets :

```
window.PH_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "panorama-hotel.firebaseapp.com",
  projectId: "panorama-hotel",
  appId: "1:123456789:web:abcdef123456"
};
```

3. Enregistrez (Ctrl+S). Ces valeurs ne sont pas des mots de passe : la protection vient des règles de l'étape 2.4.

---

## 3. Mettre le site en ligne (gratuit)

### Option A : Netlify (recommandée)
1. Allez sur **https://app.netlify.com/drop**.
2. Si le site le demande, créez un compte gratuit (e-mail ou compte Google), puis revenez sur cette page.
3. Faites glisser le **dossier entier** `panorama-hotel` dans la zone « Drag and drop your site folder here ».
4. Attendez quelques secondes. Netlify affiche une adresse du type `https://nom-aleatoire-123.netlify.app`.
5. Pour la renommer : **Site configuration > Change site name**, puis choisissez par exemple `panorama-hotel`. Votre adresse devient `https://panorama-hotel.netlify.app` (si le nom est libre).

### Option B : Cloudflare Pages
1. Allez sur **https://dash.cloudflare.com** et créez un compte gratuit.
2. **Workers & Pages > Create > Pages > Upload assets**.
3. Nom du projet, puis envoyez le dossier `panorama-hotel`, puis **Deploy**.

### Autoriser votre adresse dans Firebase (si la connexion échoue)
1. Firebase > **Authentication > Paramètres > Domaines autorisés**.
2. **Ajouter un domaine**, saisissez `panorama-hotel.netlify.app` (sans `https://`), puis **Ajouter**.

---

## 4. Premier lancement

1. Ouvrez votre adresse dans un navigateur. L'écran **Bienvenue** apparaît.
2. Remplissez : nom de l'hôtel, devise (par exemple `USD`, `CDF`, `EUR`), votre nom, un identifiant (par exemple `admin`), un mot de passe de 6 caractères minimum, la confirmation. Vous pouvez cocher « Charger des données de démonstration » pour essayer, mais pas pour une vraie exploitation.
3. Cliquez sur **Créer et commencer**.

**Faites-le tout de suite après la mise en ligne.** Tant que ce compte administrateur n'existe pas, toute personne qui connaît l'adresse pourrait le créer.

---

## 5. Configurer l'hôtel

1. **Chambres** > **Nouvelle chambre** : numéro, type, étage, capacité, tarif par nuit. Les clients ne peuvent réserver qu'un type de chambre qui existe ici.
2. **Paramètres** :
   - Nom, adresse, téléphone, e-mail, identifiant fiscal.
   - Devise, TVA incluse dans les prix, taxe de séjour.
   - Heures d'arrivée et de départ.
   - **Activer la réservation en ligne** (coché).
   - **Acompte en ligne (%)**, par exemple 50.
   - **Autoriser « payer à l'arrivée »** : cochez pour permettre la dette.
   - **Instructions Mobile money** : numéro et nom du bénéficiaire (visibles par les clients).
   - **Coordonnées bancaires** pour les virements.
   - **Conditions** affichées aux clients.
   - Cliquez sur **Enregistrer**.
3. **Utilisateurs & rôles** > **Nouvel utilisateur** : un compte par employé, avec son rôle (Réceptionniste, Gouvernante, Comptable, etc.). Chaque personne se connecte avec son identifiant et son mot de passe.

---

## 5 bis. Changer le logo et la photo de connexion

Vous n'avez pas besoin de toucher au code : il suffit de déposer vos images.

1. Préparez vos deux images :
   - **le logo** : une image carrée, environ 256 × 256 pixels, en PNG (fond transparent ou blanc) ;
   - **la photo de connexion** : une photo en format paysage (plus large que haute), environ 1600 × 1000 pixels, en JPG, moins de 500 Ko de préférence.
2. Renommez-les exactement **`logo.png`** et **`login.jpg`** (en minuscules). Sous Windows, vérifiez que le fichier ne s'appelle pas `logo.png.png` : dans l'Explorateur, menu **Affichage**, cochez **Extensions de noms de fichiers**.
3. Copiez-les dans le dossier **`img`** du projet (à côté du fichier `LISEZ-MOI.txt`).
4. Republiez le dossier entier (étape 8, mise à jour).
5. Rechargez la page. Si l'ancienne image reste affichée, rechargez avec **Ctrl+F5**.

**Où ils apparaissent :**
- le logo s'affiche dans le menu de gauche, sur la page de connexion, dans l'espace client et dans l'onglet du navigateur ;
- la photo s'affiche à gauche de la page de connexion et de l'écran d'installation, sur ordinateur et tablette en mode paysage. Sur téléphone, cette partie est masquée pour laisser la place au formulaire.

**Autre nom ou autre format** (par exemple `logo.svg` ou `photo.webp`) : ouvrez **config.js** et changez le nom à la fin du fichier :

```
window.PH_BRAND = {
  logo: "img/logo.svg",
  loginPhoto: "img/photo-hotel.webp"
};
```

**Revenir au logo et au décor d'origine :** supprimez simplement les images du dossier `img`.

Le **nom de l'hôtel** affiché à côté du logo se change dans l'application : **Paramètres > Nom de l'hôtel**.

---

## 6. Donner le lien aux clients

Le lien de réservation est votre adresse suivie de `#reserver` :

`https://panorama-hotel.netlify.app/#reserver`

Partagez-le par WhatsApp, Facebook ou sur une affiche. Pour un QR code, collez ce lien sur un générateur gratuit de QR codes.

---

## 7. Test complet avant d'annoncer

Faites chaque test et cochez :

1. Ouvrez le lien de réservation en **navigation privée**.
2. Choisissez des dates et un type de chambre, puis vérifiez que le prix est correct.
3. Réservez avec **Mobile money** et une fausse référence. Vous devez obtenir un code `W-XXXXXX`.
4. Cliquez sur **Suivre ma réservation** : saisissez le code et le téléphone, la réservation s'affiche.
5. Connectez-vous comme personnel : la réservation apparaît dans **Réservations**, marquée « En ligne ».
6. Dans **Facturation & caisse**, le paiement apparaît en « à vérifier » : cliquez sur **Valider**.
7. Dans **Planning**, la chambre est bloquée sur les bonnes dates.
8. Refaites la même réservation de chambre aux mêmes dates : la chambre ne doit plus être proposée.
9. Supprimez l'essai (annulez la réservation).

---

## 8. Mettre à jour l'application plus tard

1. Remplacez le fichier modifié dans votre dossier.
2. Netlify : ouvrez votre site > **Deploys**, puis faites glisser à nouveau le dossier entier.
3. Vos données restent intactes : elles sont dans Firebase, pas dans les fichiers.

---

## 9. Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Le logo et la photo de connexion | Déposez `logo.png` et `login.jpg` dans `img/` (voir 5 bis) |
| Les couleurs, les polices, la mise en page | `css/style.css` |
| Les valeurs par défaut (devise, types de chambre, acompte, conditions) | `js/core/parametres.js` |
| Les droits des rôles par défaut | `js/core/permissions.js` |
| Les moyens de paiement proposés aux clients | `js/modules/espace-client.js` (bloc `PM`) |
| Le message de confirmation envoyé au client | `js/modules/espace-client.js` (fonction `confText`) |
| La facture | `js/modules/folio-facture.js` |
| Les règles de sécurité | `firestore.rules` (puis republier dans Firebase) |

---

## 10. Dépannage

| Ce que vous voyez | Cause probable | Solution |
|---|---|---|
| Bandeau « Version non configurée » | `config.js` est vide ou n'a pas été renvoyé | Remplissez `config.js` et republiez le dossier |
| Bandeau « Impossible de charger Firebase » | Pas d'Internet, ou Firebase est bloqué | Vérifiez la connexion, rechargez la page |
| Page blanche | Un fichier a été déplacé ou le dossier est mal organisé | Reprenez l'organisation de l'étape 0 |
| « Configuration refusée par la base » à l'installation | Règles non publiées ou base non créée | Refaites 2.3 et 2.4 |
| « Activez E-mail/Mot de passe » | Étape 2.2 manquante | Faites l'étape 2.2 |
| « Base de données injoignable ou règles non publiées » sur la page de connexion | Même cause | Refaites 2.3 et 2.4 |
| « Identifiant ou mot de passe incorrect » | Faute de frappe | Recommencez. Après 5 échecs, patientez 30 secondes |
| « Réservation indisponible » côté client | Aucune chambre créée, option désactivée, ou installation non faite | Étapes 4 et 5 |
| « Action refusée par la base de données » | Votre rôle n'a pas le droit, ou les règles sont anciennes | Vérifiez le rôle, republiez les règles |
| Mon logo ou ma photo ne s'affiche pas | Nom de fichier différent (majuscule, `.png.png`, `.jpeg` au lieu de `.jpg`) ou mauvais dossier | Vérifiez le nom exact et que l'image est dans `img/`, puis Ctrl+F5 |
| Une chambre libre n'apparaît pas aux clients | Les disponibilités ne sont pas synchronisées | **Paramètres > Espace client > Resynchroniser** |

---

## 11. Limites à connaître

- **Gratuit mais limité :** Google indique, à titre d'exemple, 50 000 lectures et 20 000 écritures par jour sur le plan gratuit. C'est largement suffisant pour un petit hôtel.
- **Paiements non automatiques :** vous vérifiez chaque paiement Mobile money ou virement vous-même, puis vous le validez.
- **Pas de SMS ni d'e-mail automatiques :** le client voit sa confirmation à l'écran et peut l'envoyer par WhatsApp ou la copier.
- **Droits des rôles :** appliqués dans l'interface. La base protège en plus la paie, le journal et la gestion des comptes. Les autres données restent lisibles par tout membre actif du personnel.
- **Fausses réservations :** rien n'empêche d'en créer. Vérifiez les paiements avant de valider.
- **Mot de passe oublié :** fonctionne seulement si l'identifiant est une vraie adresse e-mail. Sinon, créez un nouveau compte pour la personne et désactivez l'ancien.
- **Sauvegarde :** dans **Paramètres**, exportez régulièrement un fichier de sauvegarde.
