# Dreame Open Card

Carte Lovelace indépendante pour les aspirateurs Dreame. Elle est gratuite, sous licence MIT, et fonctionne sans clé d’activation. La carte utilise les entités, les actions et la caméra fournies par Home Assistant.

## Installation

1. Installez et configurez [Dreame Vacuum](https://github.com/Tasshack/dreame-vacuum). Dans **Outils de développement → États**, relevez l’identifiant du robot et, si disponible, celui de sa caméra de carte en direct.
2. Téléchargez [dreame-open-card.js](dreame-open-card.js) depuis ce dépôt et placez-le dans `/config/www/dreame-open-card.js`. Si vous venez de créer le dossier `www`, redémarrez Home Assistant.
3. Dans **Paramètres → Tableaux de bord → Ressources**, ajoutez `/local/dreame-open-card.js` comme **Module JavaScript**. Activez le mode avancé dans votre profil si le menu Ressources est absent.
4. Ajoutez une carte manuelle et remplacez les identifiants de l’exemple par ceux de votre instance.

```yaml
type: custom:dreame-open-card
entity: vacuum.dreame
map_camera: camera.dreame_map
```

`map_camera` et `title` sont facultatifs. Pour un affichage pleine largeur, utilisez une vue de type **Panneau**. Si le panneau **Réglages, station et entretien** ne trouve pas les entités du robot, indiquez-les dans `entities`.

```yaml
type: custom:dreame-open-card
entity: vacuum.dreame
map_camera: camera.dreame_map
title: Aspirateur
entities:
  - button.dreame_auto_empty
  - select.dreame_cleaning_mode
  - sensor.dreame_main_brush_left
```

## Fonctions

- Démarrage, pause, arrêt, retour à la station, localisation et niveau de batterie.
- Nettoyage par pièces, zone et point, déplacement vers un point et changement d’étage. La sélection sur l’image exige une caméra de carte active avec des coordonnées de calibration.
- Réglages, programmation et entretien via les entités exposées par le robot. Les commandes de la station apparaissent si l’intégration fournit les entités correspondantes.
- Historique, photos d’obstacles, alertes et télécommande pas à pas, selon les données et actions exposées.
- Renommage, découpe et fusion de pièces, sauvegarde et restauration de cartes, murs, zones interdites, tapis, mobilier et matériaux via les formulaires d’actions. Home Assistant valide le format détaillé des paramètres. Une confirmation est requise avant chaque action avancée.

Les fonctions dépendent du modèle, de la version de Dreame Vacuum et des entités activées. La carte a été développée à partir des interfaces de l’intégration v2.0.3. La planification dépend des entités de l’installation. Pour une version de Home Assistant sans découverte d’entités par appareil, configurez `entities` explicitement.

Cette première version propose des formulaires pour l’édition de carte. L’édition graphique complète, la composition d’un fond personnalisé par étage, le contrôle continu et la vue vidéo ne sont pas inclus.

## Développement

`npm test` exécute les tests avec Node.js, sans installation de dépendances. Les scénarios Lovelace ont également été essayés dans Chromium avec des données Home Assistant simulées.

[Notes de rétro-ingénierie](docs/reverse-engineering.md) · [Licence MIT](LICENSE)
