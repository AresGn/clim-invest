Voici un **guide complet**, en français, pour intégrer efficacement les données climatiques et météorologiques dans votre application **React Native / Expo**, en utilisant **OpenEPI**, avec des **exemples de code** clés et des sources complémentaires pour valider (ou compléter) les données. Le tout s’appuie sur des API fiables pour construire la couche **intelligence météo / risque climatique** répondant aux besoins de Clim‑Invest.

---

## 1. Vue d’ensemble : architecture générale

| Étape   | Description                                  | Technologies & API                                                                               | Objectif                                                                        |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **1.1** | Installation du client JavaScript OpenEPI    | `npm install @openepi/client —save`                                                              | Facile accès aux endpoints via la lib JS officielle ([developer.openepi.io][1]) |
| **1.2** | Récupération des données météo / climatiques | API OpenEPI (station, satellite, agrégation), Open‑Meteo, WIS2 Burkina                           | Alimenter historiques, temps réel, indices NDVI etc.                            |
| **1.3** | Validation & réconciliation des données      | Comparer OpenEPI ↔ données natives (Météo Burkina API WIS2) ou reanalyses Open‑Meteo (ERA5, IFS) | s’assurer de la cohérence, détecter divergences ou biais                        |
| **1.4** | Calcul d’indices (NDVI, stress hydrique, ET) | Intégrer NDVI satellitaire + dérivés FAO‑56 ET₀ ou anomalies modulaires                          | Détecter alerte sécheresse/surdité pluies                                       |
| **1.5** | Dashboard client / tarification dynamique    | Consommer données en fonction GPS via `navigator.geolocation` + GraphQL ou REST interne          | Alertes temps‑réel, déclenchements auto‑indemnisation et prime dynamique        |

---

## 2. Intégration OpenEPI dans Expo

### 2.1. Installation

```bash
expo install @openepi/client
```

ou dans n’importe quelle app React ou React Native :

```bash
npm install @openepi/client
```

### 2.2. Authentification (combo expo‑secure‐store ou env)

```ts
// src/openepi.ts
import OpenEpi from '@openepi/client';

export const openEpi = new OpenEpi({
  url: 'https://api.openepi.io',  // URL de base (exemple)
  apiKey: process.env.OPENEPI_API_KEY /* ou SecureStore */
});
```

### 2.3. Appel de données (historique ou temps réel)

```ts
// fetch.js
import { openEpi } from './openepi';
import type { ClimateHistoricalResponse } from '@openepi/client';

export async function fetchPrecipitationDaily(
  lat: number,
  lon: number,
  begin: string,  // 'YYYY‑MM‑DD'
  end: string
): Promise<number[]> {
  const resp: ClimateHistoricalResponse = await openEpi.getHistorical({
    variables: ['precipitation_sum', 'temperature_2m_min', 'temperature_2m_max'],
    bbox: [lon - 0.1, lat - 0.1, lon + 0.1, lat + 0.1],
    start: begin,
    end: end
  });
  return resp.daily.precipitation_sum;
}
```

### 2.4. Affichage dans un composant Expo

```tsx
// DashboardMeteo.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import { fetchPrecipitationDaily } from './fetch';

export default function DashboardMeteo() {
  const [todayPrecip, setToday] = useState<number | null>(null);
  useEffect(() => {
    async function load() {
      const { coords } = await Location.getCurrentPositionAsync();
      const today = new Date().toISOString().slice(0, 10);
      const data = await fetchPrecipitationDaily(coords.latitude, coords.longitude, today, today);
      setToday(data[0] ?? 0);
    }
    load();
  }, []);
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>Pluie aujourd’hui: {todayPrecip} mm</Text>
    </View>
  );
}
```

---

## 3. Autres API complémentaires pour validation et fiabilité

### 3.1. **Météo Burkina** (WIS2 in a box API)

* Plateforme nationale interopérable avec WMO, propose accès à son réseau SYNOP, bords, analyses, via **OAPI** swagger ([wis2.meteoburkina.bf][2]).
* Vous pouvez interroger en GET `/stations`, `/observations?station=…&start=…&end=…` pour obtenir des séries horaires certifiées.
* Exemple validation : comparez précipitation journalière OpenEPI ↔ valeurs WIS2 pour une station au même intervalle.

### 3.2. **Open‑Meteo (API libre)**

* API libre, pas de clé pour usage non commercial, deux services utiles :

    * **Climate API** : modèles CMIP6 de 1950 à 2050 à résolution 10 km (NDVI, température, vent, pluie) ([open-meteo.com][3])
    * **Historical Weather API** (ERA5‑Land, ECMWF IFS reanalysis) pour obtenir des valeurs horaires/quotidiennes cohérentes depuis 1940 avec délai de 2‑5 jours ([open-meteo.com][3])
* Pour validation : obtenez, pour les mêmes coords et dates, les pluies et comparez aux données OpenEPI. Le biais moyen devrait être ≤ ±10 % selon les études.

### 3.3. **Centre AGRHYMET (CILSS / ECOWAS)**

* Fournit cartes d’indice pluviométrique, stress hydrique, bulletins de suivi (via CropWatch, CHIRPS, etc.) pour les 17 pays du Sahel ([ccr1-agrhymet.cilss.int][4])
* Leur système logiciel HYDROMET centralise pluies, vent, hydrologie — utile en cas d’écart important.
* Diffusion publique souvent via bulletins PDF, mais un portail REST/OAPI est en cours (via AGRHYMET évènements de développement), demande d’accès possible.

### 3.4. **Données de végétation NDVI (NASA / Copernicus / MOD13)**

* La NASA publie des **NDVI** à base de données MODIS datant de 2000 à aujourd’hui, ainsi que des valeurs **anomalies** comparatives ([earthdata.nasa.gov][5]).
* Exemple : utilisez l’API **NASA Earthdata STAC** ou **ClimateSERV OPeNDAP** pour charger NDVI gridded et calculer la moyenne sur une `bbox`.
* Pour l’élevage ou les cultures sensibles à la sécheresse, une **anomalie NDVI négative** sur plusieurs semaines est un indice fort de stress hydrique.

---

## 4. Code React Native + Expo pour vérifier et réconcilier les données

```ts
import { openEpi } from './openepi';

export async function validateData(lat: number, lon: number, date: string) {
  const open = await openEpi.getHistorical({
    variables: ['precipitation_sum', 'temperature_2m_max'],
    bbox: [lon - 0.05, lat - 0.05, lon + 0.05, lat + 0.05],
    start: date,
    end: date
  });

  const meteobf = await fetch(
    `https://wis2.meteoburkina.bf/oapi/observations?lat=${lat}&lon=${lon}&start=${date}&end=${date}`
  ).then(r => r.json());

  const meteoO = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=precipitation_sum,temperature_2m_max`
  ).then(r => r.json());

  // Ex. de réconciliation simple :
  const epiPrecip = open.daily.precipitation_sum[0];
  const bfPrecip = meteobf[0]?.precipitation ?? null;
  const omPrecip = meteoO.daily.precipitation_sum[0];

  return {
    open, bfPrecip, omPrecip,
    epsilonOpiVsBF: (epiPrecip - bfPrecip) / bfPrecip,
    epsilonOpiVsOM: (epiPrecip - omPrecip) / omPrecip
  };
}
```

Intégrez cette fonction dans un hook `useValidate(date, lat, lon)` pour afficher à l’utilisateur un état de **cohérence des données** (⚠️ divergences > 20 % : signal d’alerte ou enquête manuelle).

---

## 5. Indicateurs spécifiques & modélisation dynamique

* Calculez l’**ET₀ (évapotranspiration de référence)** via FAO‑56 depuis variables OpenEPI / Open‑Meteo (température, humidité, vent, radiation solaire).
* Utilisez les données récemment téléchargées pour :

    * Déterminer le nombre de **jours sans pluie > x mm** (sécheresse en germination)
    * Analyser des **anomalies NDVI** (via NASA) pour détecter zones asséchées
    * Définir seuils de déclenchement d’alerte / indemnisation

Dans React Native, stockez les données historisées dans un **Contexte / Redux state**, puis des fonctions calculent les indices pour le dashboard ou les alertes.

---

## 6. Optimisation Expo : mise à jour et localisation

* Utilisez `expo-location` pour obtenir les **coordonnées GPS de l’utilisateur agriculteur** et charger les données pour dix premiers kilomètres autour → **taille de BBOX flexible** selon densité data.
* Configurez un **fetch régulier** (ex. avec `setInterval`, ou en tâche background) toutes les 4 heures pour les prévisions/pluies :

    * Omettre si l’utilisateur n’est plus connecté au Wi‑Fi ou batterie faible.

---

## 7. Visualisation & UX

* Utilisez des bibliothèques comme **Victory**, **Reanimated Chart**, **react-native-svg** pour tracer :

    * Séries journalières de précipitations
    * NDVI vs moyenne historique
    * Graphiques d’alerte précalculés (zones gris = pluie, rouge = stress humides)

Affichez un petit **widget avertissement météo** avec messages type :

* *« Alerte sécheresse ! Pluies records absentes depuis 28 jours (0,5 mm en moyenne). Compensé : anomalie NDVI = −25 % »*
* *« Précipitation détectée demain (modèles climatiques), déclenchement possible de couverture »*

---

## 8. Bonnes pratiques & assignations juridiques

* Respectez les licences d’attribution :

    * Open EPI : CC‑BY‑4.0 (attribuez la source)
    * Open‑Meteo / CMIP6 : usage non commercial autorisé, mentionner « Open‑Meteo (CMIP6 models) », citer les sources, mention limité à usage non commercial ([open-meteo.com][3]).
    * Météo Burkina / WIS2 : suivre le modèle TCP/IP ou MoU, faire figurer emblème ANAM.
    * NASA / Copernicus : CC‑BY (NDVI) → inclure crédits NASA, identifier la collection (ex. « MODIS/Terra NDVI, NASA 2024 »).
* Gérer les quotas API (OpenEPI vous attribue des clés à débit limité). Utilisez un service proxy serveur ou cache (Redis) pour limiter les appels en période de forte charge.
* Documentez les **seuils de qualité** : `error_ratio > 0.2` enseignant flag interne, déclencheur d’examen manuel de sinistre.

---

## 9. Résumé rapide

En combinant :

* la **librairie JavaScript OpenEPI**, l’API **WIS2 Burkina**, l’API **Open‑Meteo** et compléments satellitaires de **NASA / AGRHYMET**,
* vous obtenez :

    * des données météo locales et certifiées (pluie, vent, pression, radiation),
    * des **indices NDVI et ET₀** utiles à la détection de stress hydrique,
    * un mécanisme de **validation croisée** permettant de détecter les écarts de données,
    * des **triggers automatiques** pour alerter l’utilisateur ou déclencher une indemnisation,
    * une **tarification dynamique** selon le risque climatique local.

---


---

Ce plan vous fournit une base robuste pour construire la **couche climat intelligence** de Clim‑Invest. N’hésitez pas à me demander des extensions de code (ex. calcul d’indice ET₀, affichage carte via Leaflet React Native, ou modèle machine‑learning pour la prédiction de rendement à partir du NDVI).

[1]: https://developer.openepi.io/ "OpenEPI | Developer portal"
[2]: https://wis2.meteoburkina.bf/oapi/openapi?f=html&utm_source=chatgpt.com "Swagger UI - WIS2 in a box API"
[3]: https://open-meteo.com/en/docs/historical-weather-api?utm_source=chatgpt.com "️ Historical Weather API | Open-Meteo.com"
[4]: https://ccr1-agrhymet.cilss.int/en/?utm_source=chatgpt.com "AGRHYMET RCC-WAS – Portal of the Regional Climate ..."
[5]: https://www.earthdata.nasa.gov/topics/land-surface/normalized-difference-vegetation-index-ndvi?utm_source=chatgpt.com "Normalized Difference Vegetation Index (NDVI)"
