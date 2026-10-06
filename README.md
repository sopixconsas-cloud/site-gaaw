# Site vitrine GAAW Livraison Express

Site statique (HTML, CSS, JavaScript), sans dépendance ni étape de compilation : il se publie tel quel sur GitHub Pages.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil : hero animé, étapes, paiement réparti, profils, devenir livreur, FAQ, téléchargement |
| `telecharger.html` | Lien unique de téléchargement : redirige vers l'App Store ou Google Play selon le téléphone (c'est aussi la cible du code QR) |
| `mentions-legales.html`, `cgu.html`, `confidentialite.html`, `cookies.html` | Documents juridiques (GAAW-JUR-11, 01, 06, 07) |
| `404.html` | Page d'erreur autonome (styles intégrés), fonctionne aussi dans un sous-dossier github.io |
| `assets/js/config.js` | **Liens des stores, à compléter au lancement** |
| `assets/css/style.css`, `assets/js/main.js` | Styles et animations |
| `assets/img/logo/` | Logos officiels extraits de la charte graphique (vectoriels, non redessinés) |
| `assets/img/ecrans/` | Écrans de l'application |
| `sitemap.xml`, `robots.txt` | Référencement |

## Avant la mise en ligne

1. **Liens des stores** : dans `assets/js/config.js`, collez les URL App Store et Google Play. Tant qu'ils sont vides, les boutons affichent « Bientôt » et la page `telecharger.html` propose d'être prévenu par e-mail.
2. **Mentions entre crochets** : tous les passages surlignés en jaune dans les pages juridiques (`[GAAW SAS]`, `[•]`, `[adresse complète]`, `[JJ/MM/AAAA]`…) doivent être complétés. Recherchez `class="todo"` dans les 4 fichiers, remplacez le texte et supprimez la balise `<mark>`.
3. **Domaine** : le site est préparé pour `https://www.gaaw.fr/`. Si le domaine est différent, remplacez `https://www.gaaw.fr/` dans tous les fichiers (VS Code : Ctrl+Maj+H) et dans `sitemap.xml` / `robots.txt`.
4. **Adresses e-mail** : le site utilise `contact@gaaw.fr` et `support@gaaw.fr` (comme les documents juridiques). L'application affiche `support@gaaw.com` : harmonisez si besoin.
5. **Domaine personnalisé** : ajoutez un fichier `CNAME` contenant `www.gaaw.fr`, puis chez le registrar : 4 enregistrements A vers 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 et un CNAME `www` vers `<votre-compte>.github.io.`

## Cookies

Le site vitrine ne dépose aucun cookie ni traceur : pas besoin de bandeau. Seules les polices (Google Fonts) et la petite bibliothèque du code QR (cdnjs) sont chargées depuis l'extérieur, sans cookie. Si vous ajoutez un outil de statistiques, il faudra un bandeau de consentement conforme à la politique cookies.
