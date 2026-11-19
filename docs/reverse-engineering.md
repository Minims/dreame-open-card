# Rétro-ingénierie de Dreame Vacuum Card

## Ce que le navigateur a chargé

L’accueil français est généré par VitePress. Le scénario REA a ouvert la page, refusé les cookies puis suivi le lien d’activation jusqu’à `/fr/get-dvc`. La capture a enregistré 135 transactions, dont une seule requête de type document. L’activation de la carte est décrite dans la documentation comme une opération de l’intégration Home Assistant. [Accueil](https://dvc.tasshack.com/fr/) · [Activation](https://dvc.tasshack.com/fr/get-dvc)

REA a analysé un fichier JavaScript minifié issu d’une capture locale de l’interface Dreame. L’analyse a parcouru 152 314 nœuds syntaxiques et relevé 289 observations statiques. Une seconde lecture syntaxique a confirmé deux sites d’appel explicites à `customElements.define`. Le graphe sémantique reste partiel et le module commercial n’a pas été exécuté pendant cette analyse.

## Interfaces reprises dans Dreame Open Card

| Fonction | Interface examinée |
| --- | --- |
| Nettoyer par pièce, point ou zone | Actions `vacuum_clean_segment`, `vacuum_clean_spot` et `vacuum_clean_zone` du domaine `dreame_vacuum`. |
| Pointer sur la carte | La caméra fournit `calibration_points`, avec trois paires de coordonnées `map` et `vacuum`. La carte utilise une transformation affine pour convertir un point de l’image en coordonnées du robot. |
| Choisir une carte | L’aspirateur expose `maps` et `selected_map_id`. La carte envoie `vacuum_select_map` avec l’identifiant de l’étage. |
| Consulter les images | La carte de navigation, l’historique et les photos d’obstacles sont accessibles par les URL de caméra de l’instance Home Assistant. |
| Piloter les réglages | La carte identifie les entités par le registre d’appareils Home Assistant et utilise les actions de leurs domaines. |

[Actions et schémas](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/vacuum.py) · [Caméra](https://github.com/Tasshack/dreame-vacuum/blob/v2.0.3/custom_components/dreame_vacuum/camera.py) · [Documentation Lovelace](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)

## Références d’analyse

- Scénario REA sur le site public · `ev_4a1786cb475a11c5a6e7ffe90be75e79a89747effd628990d1cab316da337acf`.
- Analyse REA du fichier local · `ev_78564440b4da28765b31ec1c477dbea6b4bfa9a73acdb57b07f4e12e67da3909`.
- Fichier JavaScript examiné · 660 645 octets · SHA-256 `161cc7c47696d40a2c0cf16c65327dd38bc027aded429af0df3605358aa486d2`.
